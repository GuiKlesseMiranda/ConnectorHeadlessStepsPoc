import { Page } from 'playwright';
import { Step } from '../step';

export const fill = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('fill: selector is required');
  return page.fill(step.selector, String(step.value ?? ''), step.options);
};
