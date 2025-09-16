import { Page } from 'playwright';
import { Step } from '../step';

export const waitForSelector = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('waitForSelector: selector is required');
  return page.waitForSelector(step.selector, step.options);
};
