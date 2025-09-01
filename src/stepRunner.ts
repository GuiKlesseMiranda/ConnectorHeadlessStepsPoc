import type { Page } from 'playwright';
import type { Step } from './types';

// map of supported actions; easy to extend
export const StepHandlers: Record<
  string,
  (page: Page, step: Step) => Promise<any>
> = {
  // navigation
  async goto(page, step) {
    return page.goto(String(step.value), step.options);
  },
  async waitForNavigation(page, step) {
    return page.waitForNavigation(step.options);
  },
  async reload(page, step) {
    return page.reload(step.options);
  },

  // interaction
  async click(page, step) {
    if (!step.selector) throw new Error('click: selector is required');
    return page.click(step.selector, step.options);
  },
  async dblclick(page, step) {
    if (!step.selector) throw new Error('dblclick: selector is required');
    return page.dblclick(step.selector, step.options);
  },
  async fill(page, step) {
    if (!step.selector) throw new Error('fill: selector is required');
    return page.fill(step.selector, String(step.value ?? ''), step.options);
  },
  async type(page, step) {
    if (!step.selector) throw new Error('type: selector is required');
    return page.type(step.selector, String(step.value ?? ''), step.options);
  },
  async press(page, step) {
    if (!step.selector) throw new Error('press: selector is required');
    return page.press(step.selector, String(step.value ?? ''), step.options);
  },
  async check(page, step) {
    if (!step.selector) throw new Error('check: selector is required');
    return page.check(step.selector, step.options);
  },
  async uncheck(page, step) {
    if (!step.selector) throw new Error('uncheck: selector is required');
    return page.uncheck(step.selector, step.options);
  },
  async hover(page, step) {
    if (!step.selector) throw new Error('hover: selector is required');
    return page.hover(step.selector, step.options);
  },
  async selectOption(page, step) {
    if (!step.selector) throw new Error('selectOption: selector is required');
    return page.selectOption(step.selector, step.value, step.options);
  },

  // waiting
  async waitForSelector(page, step) {
    if (!step.selector)
      throw new Error('waitForSelector: selector is required');
    return page.waitForSelector(step.selector, step.options);
  },
  async wait(page, step) {
    // value = ms
    return page.waitForTimeout(Number(step.value ?? 0));
  },

  // evaluation
  async evaluate(page, step) {
    // value = JS code string or a serializable function
    if (typeof step.value === 'string') {
      const code = String(step.value);
      return page.evaluate(`(async()=>{ ${code} })()`);
    }
    return page.evaluate(step.value);
  },

  async setExtraHTTPHeaders(page, step) {
    // value = Record<string,string>
    return page.context().setExtraHTTPHeaders(step.value || {});
  },
  async setUserAgent(page, step) {
    const ua = String(step.value ?? '');
    return page.context().setExtraHTTPHeaders({ 'user-agent': ua });
  },
  async setViewport(page, step) {
    return page.setViewportSize(step.value);
  },

  async route(page, step) {
    // value = { urlPattern, handlerCode }
    const { urlPattern, handlerCode } = step.value || {};
    await page.route(urlPattern, async (route, request) => {
      if (handlerCode) {
        // handlerCode receives { url, method, headers, postData }
        const r = {
          url: request.url(),
          method: request.method(),
          headers: request.headers(),
          postData: request.postData(),
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
  },
  // waits
  async waitForFunction(page, step) {
    // value = fn string/Function; args optional em step.args
    const fn = step.value;
    const args = (step as any).args;
    return page.waitForFunction(fn, args, step.options);
  },
  async waitForLoadState(page, step) {
    // value = 'load' | 'domcontentloaded' | 'networkidle'
    return page.waitForLoadState(step.value ?? 'load', step.options);
  },
  async waitForURL(page, step) {
    // value = string | RegExp | (url)=>boolean
    return page.waitForURL(step.value, step.options);
  },
  async waitForRequest(page, step) {
    return page.waitForRequest(step.value, step.options);
  },
  async waitForResponse(page, step) {
    return page.waitForResponse(step.value, step.options);
  },

  async focus(page, step) {
    if (!step.selector) throw new Error('focus: selector is required');
    return page.focus(step.selector);
  },

  // keyboard
  async keyboardType(page, step) {
    return page.keyboard.type(String(step.value ?? ''), step.options);
  },
  async keyboardPress(page, step) {
    return page.keyboard.press(String(step.value ?? ''), step.options);
  },
  async keyboardDown(page, step) {
    return page.keyboard.down(String(step.value ?? ''));
  },
  async keyboardUp(page, step) {
    return page.keyboard.up(String(step.value ?? ''));
  },

  // mouse
  async mouseMove(page, step) {
    const {
      offsetX = 0,
      offsetY = 0,
      steps,
    } = (step.value ?? {}) as {
      offsetX?: number;
      offsetY?: number;
      steps?: number;
    };
    if (step.selector) {
      const loc = page.locator(step.selector);
      await loc.waitFor({ state: 'visible', timeout: step.options?.timeout });
      await loc.scrollIntoViewIfNeeded();
      const box = await loc.boundingBox();
      if (!box)
        throw new Error(
          `mouseMove: could not resolve boundingBox for selector "${step.selector}"`
        );
      const cx = box.x + box.width / 2 + offsetX;
      const cy = box.y + box.height / 2 + offsetY;
      return page.mouse.move(cx, cy, { steps: steps ?? step.options?.steps });
    }

    const { x, y } = (step.value ?? {}) as { x?: number; y?: number };
    if (typeof x !== 'number' || typeof y !== 'number') {
      throw new Error(
        'mouseMove: provide either a selector or numeric value.x and value.y'
      );
    }
    return page.mouse.move(x + offsetX, y + offsetY, {
      steps: steps ?? step.options?.steps,
    });
  },
  async mouseDown(page, step) {
    return page.mouse.down(step.options);
  },
  async mouseUp(page, step) {
    return page.mouse.up(step.options);
  },
  async mouseWheel(page, step) {
    const { deltaX = 0, deltaY = 0 } = step.value || {};
    return page.mouse.wheel(deltaX, deltaY);
  },

  // injection
  async addScriptTag(page, step) {
    // value = { url?, path?, content?, type? }
    return page.addScriptTag(step.value || step.options);
  },
  async addStyleTag(page, step) {
    // value = { url?, path?, content? }
    return page.addStyleTag(step.value || step.options);
  },

  // dialogs
  async handleDialog(page, step) {
    // value = { action: 'accept' | 'dismiss', promptText?: string }
    const { dialogAction = 'accept', promptText } = step.value || {};
    page.once('dialog', async (d) => {
      if (dialogAction === 'accept') await d.accept(promptText);
      else await d.dismiss();
    });
  },

  // content
  async setContent(page, step) {
    // value = HTML string
    return page.setContent(String(step.value ?? ''), step.options);
  },
  // extra navigation
  async goBack(page, step) {
    return page.goBack(step.options);
  },
  async goForward(page, step) {
    return page.goForward(step.options);
  },

  // downloads
  async waitForDownload(page, step) {
    // step.value?: string (path para salvar)
    const download = await page.waitForEvent('download', step.options);
    const path = typeof step.value === 'string' ? step.value : undefined;
    if (path) await download.saveAs(path);
    return { suggestedFilename: download.suggestedFilename() };
  },

  // media / UI
  async emulateMedia(page, step) {
    // step.value = { media?: 'screen'|'print'|null, colorScheme?: 'light'|'dark'|'no-preference' }
    return page.emulateMedia(step.value as any);
  },
  async bringToFront(page) {
    return page.bringToFront();
  },

  // mobile-like
  async tap(page, step) {
    if (!step.selector) throw new Error('tap: selector is required');
    return page.tap(step.selector, step.options);
  },

  // generic events
  async waitForEvent(page, step) {
    // step.value = { eventName: string, predicate?: (e:any)=>boolean }
    const { eventName, predicate } = (step.value as any) || {};
    if (!eventName)
      throw new Error('waitForEvent: value.eventName is required');
    return page.waitForEvent(eventName, {
      predicate,
      timeout: step.options?.timeout,
    });
  },

  // context-level goodies
  async grantPermissions(page, step) {
    // step.value = { permissions: Permission[], origin?: string }
    const { permissions, origin } = (step.value as any) || {};
    if (!permissions)
      throw new Error('grantPermissions: value.permissions is required');
    return page
      .context()
      .grantPermissions(permissions, origin ? { origin } : (undefined as any));
  },
  async clearPermissions(page) {
    return page.context().clearPermissions();
  },
  async setOffline(page, step) {
    // step.value = boolean
    return page.context().setOffline(Boolean(step.value));
  },
  async addCookies(page, step) {
    // step.value = Cookie[] (Playwright Cookie object)
    return page.context().addCookies(step.value as any);
  },
  async clearCookies(page) {
    return page.context().clearCookies();
  },

  // ---- DOM helpers
  async dispatchEvent(page, step) {
    // value = { type: string, eventInit?: any }
    if (!step.selector) throw new Error('dispatchEvent: selector is required');
    const { type, eventInit } = (step.value as any) || {};
    if (!type) throw new Error('dispatchEvent: value.type is required');
    return page.dispatchEvent(step.selector, type, eventInit);
  },
  // ---- popups / dialogs / file chooser
  async waitForPopup(page, step) {
    // returns the popup Page object handle (cannot be JSON-serialized fully)
    // Consider using waitForEvent('popup') + follow-up steps referencing it
    return page.waitForEvent('popup', step.options);
  },
  async waitForFileChooser(page, step) {
    // often unnecessary (setInputFiles is better), but included if needed
    return page.waitForEvent('filechooser', step.options);
  },

  //combined selectors
  async userFill(page, step) {
    if (!step.selector) throw new Error('userFill: selector is required');

    const optionsTimeout: { timeout?: number } = {};

    if (step.options?.timeout) {
      optionsTimeout.timeout = step.options.timeout;
    }

    await (StepHandlers as any).waitForSelector(page, {
      selector: step.selector,
      options: optionsTimeout,
    });
    await (StepHandlers as any).mouseMove(page, {
      selector: step.selector,
      options: optionsTimeout,
    });

    await (StepHandlers as any).click(page, {
      selector: step.selector,
      options: optionsTimeout,
    });

    return (StepHandlers as any).type(page, {
      selector: step.selector,
      value: step.value,
      options: step.options,
    });
  },
  async userClick(page, step) {
    if (!step.selector) throw new Error('userClick: selector is required');

    const optionsTimeout: { timeout?: number } = {};

    if (step.options?.timeout) {
      optionsTimeout.timeout = step.options.timeout;
    }
    await (StepHandlers as any).waitForSelector(page, {
      selector: step.selector,
      options: optionsTimeout,
    });

    await (StepHandlers as any).mouseMove(page, {
      selector: step.selector,
      options: optionsTimeout,
    });

    await (StepHandlers as any).click(page, {
      selector: step.selector,
      options: optionsTimeout,
    });

    return (StepHandlers as any).type(page, {
      selector: step.selector,
      value: step.value,
      options: step.options,
    });
  },
};
