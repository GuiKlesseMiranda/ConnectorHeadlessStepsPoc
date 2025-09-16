import { Page } from 'playwright';
import { Step } from '../step';

export const setViewport = async (page: Page, step: Step) => {
  return page.setViewportSize(step.value as any);
};
