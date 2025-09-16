import { Page } from 'playwright';
import { Step } from '../step';

export const waitForURL = async (page: Page, step: Step) => {
  // value = string | RegExp | (url)=>boolean
  return page.waitForURL(step.value as any, step.options);
};
