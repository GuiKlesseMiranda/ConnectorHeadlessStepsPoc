import { Page } from 'playwright';
import { Step } from '../step';

export const grantPermissions = async (page: Page, step: Step) => {
  // step.value = { permissions: Permission[], origin?: string }
  const { permissions, origin } = (step.value as any) || {};
  if (!permissions)
    throw new Error('grantPermissions: value.permissions is required');
  return page
    .context()
    .grantPermissions(permissions, origin ? { origin } : (undefined as any));
};
