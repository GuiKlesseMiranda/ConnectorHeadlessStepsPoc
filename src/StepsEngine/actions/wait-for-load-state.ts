import { Page } from 'playwright';
import { Step } from '../step';

export const waitForLoadState = async (page: Page, step: Step) => {
  // value = 'load' | 'domcontentloaded' | 'networkidle'
  return page.waitForLoadState((step.value as any) ?? 'load', step.options);
};
