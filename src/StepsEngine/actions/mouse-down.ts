import { Page } from 'playwright';
import { Step } from '../step';

export const mouseDown = async (page: Page, step: Step) => {
  return page.mouse.down(step.options);
};
