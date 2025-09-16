import { Page } from 'playwright';
import { Step } from '../step';

export const goForward = async (page: Page, step: Step) => {
  return page.goForward(step.options);
};
