import { Page } from 'playwright';
import { Step } from '../step';

export const type = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('type: selector is required');
  return page.type(step.selector, String(step.value ?? ''), step.options);
};
