import { Page } from 'playwright';
import { Step } from '../step';

export const waitForEvent = async (page: Page, step: Step) => {
  // step.value = { eventName: string, predicate?: (e:any)=>boolean }
  const { eventName, predicate } = (step.value as any) || {};
  if (!eventName) throw new Error('waitForEvent: value.eventName is required');
  return page.waitForEvent(eventName, {
    predicate,
    timeout: Number(step.options?.timeout),
  });
};
