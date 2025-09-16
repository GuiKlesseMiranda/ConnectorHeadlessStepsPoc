import { Page } from 'playwright';
import { Step } from '../step';

export const goBack = async (page: Page, step: Step) => {
  return page.goBack(step.options);
};
