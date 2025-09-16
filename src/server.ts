import Fastify from 'fastify';
import cors from '@fastify/cors';
import { chromium, firefox, Page, webkit } from 'playwright';
import { TaskPayload, RunResult } from './types';
import { StepHandlerProvider } from './StepsEngine/step-handler-provider';
import {
  buildRequestMatcherFns,
  buildResponseMatcherFns,
  attachMatcherId,
} from './matchers';
import { StepExecutor } from './StepsEngine/step-executor';

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
  let payload: TaskPayload;

  payload = req.body as TaskPayload;

  const credentials: Record<string, any> = {};
  const matchedRequests: RunResult['matchedRequests'] = [];
  const matchedResponses: RunResult['matchedResponses'] = [];

  const browserType =
    payload.browser === 'firefox'
      ? firefox
      : payload.browser === 'webkit'
      ? webkit
      : chromium;

  const browser = await browserType.launch({
    headless: payload.headless,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
    ],
  });
  const context = await browser.newContext(payload.contextOptions);
  const page = await context.newPage(payload.pageOptions);
  await deletePlaywrightScript(page);
  await page.exposeBinding(
    'createCredential',
    (_source, name: string, value: any) => {
      credentials[name] =
        typeof value === 'string' ? value : JSON.stringify(value);
      return true;
    }
  );

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
      console.log('Response:', response.url());
      const url = new URL(response.url());
      const status = response.status();
      const found = resMatchers.find((m) => m.test(url, status));
      if (found) {
        let bodyBase64: string | undefined;
        try {
          const body = await response.body();
          bodyBase64 = Buffer.from(body).toString('base64');
        } catch {
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
    await StepExecutor.executeSteps(page, payload.steps);

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
StepHandlerProvider.loadStepHandlers().then(() => {
  app
    .listen({ port, host: '0.0.0.0' })
    .then(() => console.log(`a server on :${port}`))
    .catch((e) => {
      console.error(e);
      process.exit(1);
    });
});
