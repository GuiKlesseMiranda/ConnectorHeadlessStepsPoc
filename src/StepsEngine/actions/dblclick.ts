import { Page } from 'playwright';
import { Step } from '../step';

export const dblclick = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('dblclick: selector is required');
  return page.dblclick(step.selector, step.options);
};
