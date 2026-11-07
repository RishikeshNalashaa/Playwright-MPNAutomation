import { expect } from '@playwright/test';

export function getRunnableScenarios(testData) {
  if (!testData || !Array.isArray(testData.scenarios)) {
    throw new Error('Invalid test data. Expected an object with a scenarios array.');
  }

  return testData.scenarios.filter((scenario) => String(scenario.runMode || '').toUpperCase() === 'Y');
}

export function getRunnableRows(rows) {
  if (!Array.isArray(rows)) {
    throw new Error('Invalid tabular data. Expected an array of rows.');
  }

  return rows.filter((row) => String(row.runMode || 'Y').toUpperCase() === 'Y');
}

export async function waitForToastToDisappear(toastLocator, { visibleTimeout = 15_000, hiddenTimeout = 15_000 } = {}) {
  await expect(toastLocator).toBeVisible({ timeout: visibleTimeout });
  await toastLocator.waitFor({ state: 'hidden', timeout: hiddenTimeout });
}
