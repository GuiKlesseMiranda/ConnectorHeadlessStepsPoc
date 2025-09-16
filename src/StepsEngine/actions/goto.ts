import { Page } from 'playwright';
import { Step } from '../step';

export const goto = async (page: Page, step: Step) => {
  return page.goto(String(step.value), step.options);
};
