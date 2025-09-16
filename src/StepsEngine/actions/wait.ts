import { Page } from 'playwright';
import { Step } from '../step';

export const wait = async (page: Page, step: Step) => {
  // value = ms
  return page.waitForTimeout(Number(step.value ?? 0));
};
