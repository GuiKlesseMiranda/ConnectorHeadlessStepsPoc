import { Page } from 'playwright';
import { Step } from '../step';

export const clearCookies = async (page: Page, step: Step) => {
  return page.context().clearCookies();
};
