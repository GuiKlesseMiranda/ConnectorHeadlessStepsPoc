import { Page } from 'playwright';
import { Step } from '../step';

export const addScriptTag = async (page: Page, step: Step) => {
  // value = { url?, path?, content?, type? }
  return page.addScriptTag(step.value || step.options);
};
