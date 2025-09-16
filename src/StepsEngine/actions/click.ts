import { Page } from 'playwright';
import { Step } from '../step';

export const click = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('click: selector is required');
  return page.click(step.selector, step.options);
};
