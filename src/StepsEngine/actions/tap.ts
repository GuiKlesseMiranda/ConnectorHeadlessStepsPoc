import { Page } from 'playwright';
import { Step } from '../step';

export const tap = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('tap: selector is required');
  return page.tap(step.selector, step.options);
};
