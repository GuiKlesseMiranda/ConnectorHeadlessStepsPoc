import { Page } from 'playwright';
import { Step } from '../step';

export const setContent = async (page: Page, step: Step) => {
  // value = HTML string
  return page.setContent(String(step.value ?? ''), step.options);
};
