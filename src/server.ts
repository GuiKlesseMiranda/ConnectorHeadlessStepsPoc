import Fastify from 'fastify';
import cors from '@fastify/cors';
import { chromium, firefox, Page, webkit } from 'playwright';
import { TaskPayload, TTaskPayload, RunResult } from './types';
import { StepHandlers } from './stepRunner';
import {
  buildRequestMatcherFns,
  buildResponseMatcherFns,
  attachMatcherId,
} from './matchers';

const app = Fastify({ logger: true });
await app.register(cors, { origin: true });

app.get('/', async () => ({ ok: true, service: 'playwright-task-runner' }));
export const deletePlaywrightScript = async (page: Page) => {
    await page.addInitScript(() => {
        // @ts-ignore
        delete window.__playwright__binding__;
        // @ts-ignore
        delete window.__pwInitScripts;
        // @ts-ignore
        navigator.webdriver = false;

    });
};
app.post('/run', async (req, reply) => {
  let payload: TTaskPayload;
  try {
    payload = TaskPayload.parse(req.body);
  } catch (e: any) {
    return reply.code(400).send({ ok: false, error: e.message });
  }

  const credentials: Record<string, any> = {};
  const matchedRequests: RunResult['matchedRequests'] = [];
  const matchedResponses: RunResult['matchedResponses'] = [];

  const browserType =
    payload.browser === 'firefox'
      ? firefox
      : payload.browser === 'webkit'
      ? webkit
      : chromium;

  const browser = await browserType.launch({ headless: payload.headless });
  const context = await browser.newContext(payload.contextOptions);
  const page = await context.newPage(payload.pageOptions);
  await deletePlaywrightScript(page);
  // fornece createCredential à página (antes de qualquer script)
  await page.exposeBinding(
    'createCredential',
    (_source, name: string, value: any) => {
      credentials[name] =
        typeof value === 'string' ? value : JSON.stringify(value);
      return true;
    }
  );

  // scripts que rodam antes de QUALQUER página (iniciais):
  // - beforePageScript: roda com acesso a window.createCredential
  if (payload.beforePageScript && payload.beforePageScript.trim().length > 0) {
    await page.addInitScript(
      `(function(){ try { ${payload.beforePageScript} } catch(e){ console.error(e) } })();`
    );
  }

  // matchers
  const reqMatchers = buildRequestMatcherFns(payload);
  const resMatchers = buildResponseMatcherFns(payload);

  page.on('request', async (request) => {
    try {
      const url = new URL(request.url());
      const method = request.method();
      const found = reqMatchers.find((m) => m.test(url, method));
      if (found) {
        const item = attachMatcherId(
          {
            url: url.toString(),
            method,
            headers: request.headers(),
            postData: request.postData(),
            timestamp: Date.now(),
          },
          found.id
        );
        matchedRequests.push(item);
      }
    } catch {}
  });

  page.on('response', async (response) => {
    try {
      const url = new URL(response.url());
      const status = response.status();
      const found = resMatchers.find((m) => m.test(url, status));
      if (found) {
        // cuidado: body pode ser grande; codifica em base64
        let bodyBase64: string | undefined;
        try {
          const body = await response.body();
          bodyBase64 = Buffer.from(body).toString('base64');
        } catch {
          // alguns responses não permitem body() (streaming)
        }
        const headers: Record<string, string> = {};
        for (const [k, v] of Object.entries(await response.headers())) {
          headers[k] = String(v);
        }
        const item = attachMatcherId(
          {
            url: url.toString(),
            status,
            headers,
            bodyBase64,
            timestamp: Date.now(),
          },
          found.id
        );
        matchedResponses.push(item);
      }
    } catch {}
  });

  let ok = true;
  let error: string | undefined;

  try {
    // executa cada step sequencialmente
    for (const step of payload.steps) {
      const handler = StepHandlers[step.action];
      try {
        if (!handler) {
          // fallback: tenta chamar page[action] diretamente se existir (super abrangente)
          const anyPage: any = page as any;
          if (typeof anyPage[step.action] === 'function') {
            // @ts-ignore
            await anyPage[step.action](...(step.value ?? []), step.options);
          } else {
            throw new Error(`step not supported: ${step.action}`);
          }
        } else {
          await handler(page, step);
        }
      } catch (e: any) {
        const msg = e?.message || String(e);
        // se for opcional, ignora o erro e continua
        if (step.optional) {
          req.log?.warn(
            { action: step.action, err: msg },
            'optional step failed; continuing'
          );
          continue;
        }
        throw e;
      }
    }

    // afterExecutionScript roda ao final, com acesso a window.createCredential
    if (
      payload.afterExecutionScript &&
      payload.afterExecutionScript.trim().length > 0
    ) {
      await page.evaluate(
        `(async()=>{ try { ${payload.afterExecutionScript} } catch(e){ console.error(e) } })();`
      );
    }
  } catch (e: any) {
    ok = false;
    error = e?.message || String(e);
  }

  const cookies = await context.cookies();

  const result: RunResult = {
    ok,
    error,
    credentials,
    matchedRequests,
    matchedResponses,
    cookies,
  };

  await context.close();
  await browser.close();

  return reply.send(result);
});

const port = Number(process.env.PORT || 3000);
app
  .listen({ port, host: '0.0.0.0' })
  .then(() => console.log(`a server on :${port}`))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
