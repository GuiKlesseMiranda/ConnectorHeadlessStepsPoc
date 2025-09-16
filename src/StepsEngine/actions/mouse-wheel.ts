import { Page } from 'playwright';
import { Step } from '../step';

export const mouseWheel = async (page: Page, step: Step) => {
  const { deltaX = 0, deltaY = 0 } = (step.value || {}) as {
    deltaX?: number;
    deltaY?: number;
  };
  return page.mouse.wheel(deltaX, deltaY);
};
