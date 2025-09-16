import { Page } from 'playwright';
import { Step } from '../step';

export const reload = async (page: Page, step: Step) => {
  return page.reload(step.options);
};
