import { Page } from 'playwright';
import { Step } from '../step';

export const waitForRequest = async (page: Page, step: Step) => {
  return page.waitForRequest(step.value as any, step.options);
};
