import { Page } from 'playwright';
import { Step } from '../step';

export const selectOption = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('selectOption: selector is required');
  return page.selectOption(step.selector, step.value as any, step.options);
};
