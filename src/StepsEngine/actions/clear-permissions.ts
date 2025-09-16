import { Page } from 'playwright';
import { Step } from '../step';

export const clearPermissions = async (page: Page, step: Step) => {
  return page.context().clearPermissions();
};
