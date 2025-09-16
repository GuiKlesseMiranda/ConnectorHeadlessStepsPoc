import { Page } from 'playwright';
import { Step } from '../step';

export const keyboardType = async (page: Page, step: Step) => {
  return page.keyboard.type(String(step.value ?? ''), step.options);
};
