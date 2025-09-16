import { Page } from 'playwright';
import { Step } from '../step';

export const setExtraHTTPHeaders = async (page: Page, step: Step) => {
  // value = Record<string,string>
  return page.context().setExtraHTTPHeaders(step.value || ({} as any));
};
