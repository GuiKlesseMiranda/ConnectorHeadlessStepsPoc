import { Page } from 'playwright';
import { Step } from '../step';

export const route = async (page: Page, step: Step) => {
  // value = { urlPattern, handlerCode }
  const { urlPattern, handlerCode } = step.value || ({} as any);
  await page.route(urlPattern, async (route, request) => {
    if (handlerCode) {
      // handlerCode receives { url, method, headers, postData }
      const r = {
        url: request.url(),
        method: request.method(),
        headers: request.headers(),
        postData: request.postData(),
      };
      const result = (await page.evaluate(
        `(async (r)=>{ ${handlerCode}; return await handler(r) })`,
        r
      )) as any;
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
};
