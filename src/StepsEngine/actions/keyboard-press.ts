import { Page } from 'playwright';
import { Step } from '../step';

export const keyboardPress = async (page: Page, step: Step) => {
  return page.keyboard.press(String(step.value ?? ''), step.options);
};
