import { Page } from 'playwright';
import { Step } from '../step';

export const handleDialog = async (page: Page, step: Step) => {
  // value = { action: 'accept' | 'dismiss', promptText?: string }
  const { dialogAction = 'accept', promptText } = step.value || ({} as any);
  page.once('dialog', async (d) => {
    if (dialogAction === 'accept') await d.accept(promptText);
    else await d.dismiss();
  });
};
