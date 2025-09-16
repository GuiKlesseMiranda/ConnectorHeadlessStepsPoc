import { Page } from 'playwright';
import { Step } from '../step';

export const emulateMedia = async (page: Page, step: Step) => {
  // step.value = { media?: 'screen'|'print'|null, colorScheme?: 'light'|'dark'|'no-preference' }
  return page.emulateMedia(step.value as any);
};
