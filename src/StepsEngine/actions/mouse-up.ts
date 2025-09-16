import { Page } from 'playwright';
import { Step } from '../step';

export const mouseUp = async (page: Page, step: Step) => {
  return page.mouse.up(step.options);
};
