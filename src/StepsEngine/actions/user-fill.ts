import { Page } from 'playwright';
import { Step } from '../step';
import { keyboardType } from './keyboard-type';
import { click } from './click';
import { mouseMove } from './mouse-move';
import { waitForSelector } from './wait-for-selector';

export const userFill = async (page: Page, step: Step) => {
  if (!step.selector) throw new Error('userFill: selector is required');

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

  await click(page, {
    selector: step.selector,
    options: optionsTimeout,
  } as Step);

  return keyboardType(page, {
    selector: step.selector,
    value: step.value,
    options: step.options,
  } as Step);
};
