import { Page } from 'playwright';
import { Step } from '../step';

export const waitForDownload = async (page: Page, step: Step) => {
  // step.value?: string (path para salvar)
  const download = await page.waitForEvent('download', step.options);
  const path = typeof step.value === 'string' ? step.value : undefined;
  if (path) await download.saveAs(path);
  return { suggestedFilename: download.suggestedFilename() };
};
