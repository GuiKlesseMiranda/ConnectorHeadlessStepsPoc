import { Page } from 'playwright';
import { Step } from '../step';

export const focus = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('focus: selector is required');
  return page.focus(step.selector);
};
