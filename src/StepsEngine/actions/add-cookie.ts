import { Cookie, Page } from 'playwright';
import { Step } from '../step';

export const addCookies = async (page: Page, step: Step) => {
  // step.value = Cookie[] (Playwright Cookie object)
  return page.context().addCookies(step.value as Cookie[]);
};
