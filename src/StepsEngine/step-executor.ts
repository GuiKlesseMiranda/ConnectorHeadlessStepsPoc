import { Page } from 'playwright';
import { Step } from './step';
import { StepHandlerProvider } from './step-handler-provider';

export class StepExecutor {
  static async executeSteps(page: Page, steps: Step[]) {
    for (const step of steps) {
      const handler = StepHandlerProvider.getStepHandlers()[step.action];
      try {
        await handler(page, step);
      } catch (e: any) {
        const msg = e?.message || String(e);
        if (step.optional) {
          console.warn(
            { action: step.action, err: msg },
            'optional step failed; continuing'
          );
          continue;
        }
        throw e;
      }
    }
  }
}
