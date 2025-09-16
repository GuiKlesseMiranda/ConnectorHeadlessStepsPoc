import { Page } from 'playwright';
import { Step } from '../step';

export const keyboardUp = async (page: Page, step: Step) => {
  return page.keyboard.up(String(step.value ?? ''));
};
