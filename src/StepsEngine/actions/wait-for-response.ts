import { Page } from 'playwright';
import { Step } from '../step';

export const waitForResponse = async (page: Page, step: Step) => {
  return page.waitForResponse(step.value as any, step.options);
};
