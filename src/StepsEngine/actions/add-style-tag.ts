import { Page } from 'playwright';
import { Step } from '../step';

export const addStyleTag = async (page: Page, step: Step) => {
  // value = { url?, path?, content? }
  return page.addStyleTag(step.value || step.options);
};
