import { Page } from 'playwright';
import { Step } from '../step';

export const uncheck = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('uncheck: selector is required');
  return page.uncheck(step.selector, step.options);
};
