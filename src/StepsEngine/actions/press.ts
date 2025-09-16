import { Page } from 'playwright';
import { Step } from '../step';

export const press = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('press: selector is required');
  return page.press(step.selector, String(step.value ?? ''), step.options);
};
