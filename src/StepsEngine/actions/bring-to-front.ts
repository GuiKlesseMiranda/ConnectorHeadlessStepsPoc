import { Page } from 'playwright';
import { Step } from '../step';

export const bringToFront = async (page: Page, step: Step) => {
  return page.bringToFront();
};
