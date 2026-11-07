import { test as base, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage.js';
import { ProviderPage } from '../pages/ProviderPage.js';
import { PatientPage } from '../pages/PatientPage.js';

export const test = base.extend({
  autoLogin: [async ({ loginPage }, use, testInfo) => {
    testInfo.setTimeout(testInfo.timeout + 60_000);
    await loginPage.ensureLoggedInWithEnvCredentials();
    await use();
  }, { auto: true }],
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  providerPage: async ({ page }, use) => {
    await use(new ProviderPage(page));
  },
  patientPage: async ({ page }, use) => {
    await use(new PatientPage(page));
  },
});

export { expect };
