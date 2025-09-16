import { Page } from 'playwright';
import { Step } from '../step';

export const dispatchEvent = async (page: Page, step: Step) => {
  // value = { type: string, eventInit?: any }
  if (!step.selector) throw new Error('dispatchEvent: selector is required');
  const { type, eventInit } = (step.value as any) || {};
  if (!type) throw new Error('dispatchEvent: value.type is required');
  return page.dispatchEvent(step.selector, type, eventInit);
};
