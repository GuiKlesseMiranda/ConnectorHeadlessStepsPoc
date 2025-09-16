import { Page } from 'playwright';
import { Step } from '../step';

export const hover = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('hover: selector is required');
  return page.hover(step.selector, step.options);
};
