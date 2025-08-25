import type { Page } from "playwright";
import type { Step } from "./types";

// mapa de ações suportadas; fácil de estender
export const StepHandlers: Record<string, (page: Page, step: Step) => Promise<any>> = {
  // navegação
  async goto(page, step) {
    return page.goto(String(step.value), step.options);
  },
  async waitForNavigation(page, step) {
    return page.waitForNavigation(step.options);
  },
  async reload(page, step) {
    return page.reload(step.options);
  },

  // interação
  async click(page, step) {
    if (!step.selector) throw new Error("click: selector obrigatório");
    return page.click(step.selector, step.options);
  },
  async dblclick(page, step) {
    if (!step.selector) throw new Error("dblclick: selector obrigatório");
    return page.dblclick(step.selector, step.options);
  },
  async fill(page, step) {
    if (!step.selector) throw new Error("fill: selector obrigatório");
    return page.fill(step.selector, String(step.value ?? ""), step.options);
  },
  async type(page, step) {
    if (!step.selector) throw new Error("type: selector obrigatório");
    return page.type(step.selector, String(step.value ?? ""), step.options);
  },
  async press(page, step) {
    if (!step.selector) throw new Error("press: selector obrigatório");
    return page.press(step.selector, String(step.value ?? ""), step.options);
  },
  async check(page, step) {
    if (!step.selector) throw new Error("check: selector obrigatório");
    return page.check(step.selector, step.options);
  },
  async uncheck(page, step) {
    if (!step.selector) throw new Error("uncheck: selector obrigatório");
    return page.uncheck(step.selector, step.options);
  },
  async hover(page, step) {
    if (!step.selector) throw new Error("hover: selector obrigatório");
    return page.hover(step.selector, step.options);
  },
  async selectOption(page, step) {
    if (!step.selector) throw new Error("selectOption: selector obrigatório");
    return page.selectOption(step.selector, step.value, step.options);
  },

  // espera
  async waitForSelector(page, step) {
    if (!step.selector) throw new Error("waitForSelector: selector obrigatório");
    return page.waitForSelector(step.selector, step.options);
  },
  async wait(page, step) {
    // value = ms
    return page.waitForTimeout(Number(step.value ?? 0));
  },

  // avaliação
  async evaluate(page, step) {
    // value = string de código JS ou function serializável
    if (typeof step.value === "string") {
      const code = String(step.value);
      return page.evaluate(`(async()=>{ ${code} })()`);
    }
    return page.evaluate(step.value);
  },

  // rede/UA/view
  async setExtraHTTPHeaders(page, step) {
    // value = Record<string,string>
    return page.context().setExtraHTTPHeaders(step.value || {});
  },
  async setUserAgent(page, step) {
    const ua = String(step.value ?? "");
    return page.context().setExtraHTTPHeaders({ "user-agent": ua });
  },
  async setViewport(page, step) {
    return page.setViewportSize(step.value);
  },

  // screenshot
  async screenshot(page, step) {
    const opts = step.options || {};
    const path = typeof step.value === "string" ? step.value : undefined;
    return page.screenshot({ path, ...opts });
  },

  // rota genérica
  async route(page, step) {
    // value = { urlPattern, handlerCode }
    const { urlPattern, handlerCode } = step.value || {};
    await page.route(urlPattern, async (route, request) => {
      if (handlerCode) {
        // handlerCode recebe {url, method, headers, postData}
        const r = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData()
        };
        const result = await page.evaluate(
          `(async (r)=>{ ${handlerCode}; return await handler(r) })`,
          r
        );
        if (result && result.fulfill) {
          await route.fulfill(result.fulfill);
          return;
        }
        if (result && result.continue) {
          await route.continue(result.continue);
          return;
        }
      }
      await route.continue();
    });
  }
};
