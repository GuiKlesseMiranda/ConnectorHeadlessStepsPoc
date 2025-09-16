import type { StepHandler } from '../types';
import { readdir } from 'node:fs/promises';
import path, { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

export class StepHandlerProvider {
  static #StepHandlers: StepHandler = {};

  static getStepHandlers(): StepHandler {
    return StepHandlerProvider.#StepHandlers;
  }

  static async loadStepHandlers(): Promise<void> {
    console.log('Loading step handlers...');
    const dirPath = new URL('./actions', import.meta.url).pathname;
    const entries = await readdir(dirPath, { withFileTypes: true });

    const files = entries
      .filter((e) => e.isFile())
      .map((e) => e.name)
      .filter(
        (n) => /\.(ts)$/.test(n) && !n.endsWith('.d.ts') && n !== 'index.ts'
      );

    for (const file of files) {
      const full = path.join(dirPath, file);
      const mod = await import(pathToFileURL(full).href);
      for (const [name, val] of Object.entries(mod)) {
        if (typeof val === 'function')
          StepHandlerProvider.#StepHandlers[name] = val as StepHandler[string];
      }
    }
    resolve();
  }
}
