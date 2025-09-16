import { Page } from 'playwright';
import { Step } from '../step';

export const evaluate = async (page: Page, step: Step) => {
  // value = JS code string or a serializable function
  if (typeof step.value === 'string') {
    const code = String(step.value);
    return page.evaluate(`(async()=>{ ${code} })()`);
  }
  return page.evaluate(step.value as any);
};
