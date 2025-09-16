import { Page } from 'playwright';
import { Step } from "../step";

export const check = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('check: selector is required');
  return page.check(step.selector, step.options);
};
