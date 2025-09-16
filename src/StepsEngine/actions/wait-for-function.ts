import { Page } from 'playwright';
import { Step } from '../step';

export const waitForFunction = async (page: Page, step: Step) => {
  // value = fn string/Function; args optional em step.args
  const fn = step.value;
  const args = (step as any).args;
  return page.waitForFunction(fn as any, args, step.options);
};
