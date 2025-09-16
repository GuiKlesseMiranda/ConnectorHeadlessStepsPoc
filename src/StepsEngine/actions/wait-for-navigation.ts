import { Page } from 'playwright';
import { Step } from '../step';

export const waitForNavigation = async (page: Page, step: Step) => {
  return page.waitForNavigation(step.options);
};
