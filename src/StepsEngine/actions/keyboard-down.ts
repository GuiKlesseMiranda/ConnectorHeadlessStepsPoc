import { Page } from 'playwright';
import { Step } from '../step';

export const keyboardDown = async (page: Page, step: Step) => {
  return page.keyboard.down(String(step.value ?? ''));
};
