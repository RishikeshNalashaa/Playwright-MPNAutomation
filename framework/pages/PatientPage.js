import { expect } from '@playwright/test';

export class PatientPage {
  constructor(page) {
    this.page = page;
  }

  async verifyUrlContains(urlPart) {
    await expect(this.page).toHaveURL(new RegExp(urlPart));
  }

  async verifyTitleContains(expectedText) {
    await expect(this.page).toHaveTitle(new RegExp(expectedText, 'i'));
  }
}
