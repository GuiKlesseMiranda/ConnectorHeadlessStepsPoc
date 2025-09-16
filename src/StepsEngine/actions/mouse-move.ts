import { Page } from 'playwright';
import { Step } from "../step";

export const mouseMove = async (page: Page, step: Step) => {
  const {
    offsetX = 0,
    offsetY = 0,
    steps,
  } = (step.value ?? {}) as {
    offsetX?: number;
    offsetY?: number;
    steps?: number;
  };
  if (step.selector) {
    const loc = page.locator(step.selector);
    await loc.waitFor({
      state: 'visible',
      timeout: step.options?.timeout as number | undefined,
    });
    await loc.scrollIntoViewIfNeeded();
    const box = await loc.boundingBox();
    if (!box)
      throw new Error(
        `mouseMove: could not resolve boundingBox for selector "${step.selector}"`
      );
    const cx = box.x + box.width / 2 + offsetX;
    const cy = box.y + box.height / 2 + offsetY;
    return page.mouse.move(cx, cy, {
      steps: steps ?? step.options?.steps,
    });
  }

  const { x, y } = (step.value ?? {}) as { x?: number; y?: number };
  if (typeof x !== 'number' || typeof y !== 'number') {
    throw new Error(
      'mouseMove: provide either a selector or numeric value.x and value.y'
    );
  }
  return page.mouse.move(x + offsetX, y + offsetY, {
    steps: steps ?? step.options?.steps,
  });
};
