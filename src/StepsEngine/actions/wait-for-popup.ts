import { Page } from 'playwright';
import { Step } from '../step';

export const waitForPopup = async (page: Page, step: Step) => {
  // returns the popup Page object handle (cannot be JSON-serialized fully)
  // Consider using waitForEvent('popup') + follow-up steps referencing it
  return page.waitForEvent('popup', step.options);
};
