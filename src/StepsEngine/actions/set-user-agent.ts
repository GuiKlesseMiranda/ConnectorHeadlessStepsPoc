import { Page } from 'playwright';
import { Step } from '../step';

export const setUserAgent = async (page: Page, step: Step) => {
  const ua = String(step.value ?? '');
  return page.context().setExtraHTTPHeaders({ 'user-agent': ua });
};
