import { Page } from 'playwright';
import { Step } from '../step';
import { waitForSelector } from './wait-for-selector';
import { click } from './click';
import { mouseMove } from './mouse-move';

export const userClick = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('userClick: selector is required');

  const optionsTimeout: { timeout?: number } = {};

  if (step.options?.timeout) {
    optionsTimeout.timeout = Number(step.options.timeout);
  }
  await waitForSelector(page, {
    selector: step.selector,
    options: optionsTimeout,
  } as Step);

  await mouseMove(page, {
    selector: step.selector,
    options: optionsTimeout,
  } as Step);

  return await click(page, {
    selector: step.selector,
    options: optionsTimeout,
  } as Step);
};
