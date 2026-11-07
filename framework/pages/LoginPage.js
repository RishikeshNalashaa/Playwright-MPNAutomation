import { expect } from '@playwright/test';

export class LoginPage {
  constructor(page) {
    this.page = page;
    this.usernameInput = page.getByRole('textbox', { name: 'Username' });
    this.passwordInput = page.getByRole('textbox', { name: 'Password' });
    this.signInButton = page.getByRole('button', { name: 'Sign in' });
    this.patientsMenu = page.getByText('Patients', { exact: true });
    this.getStartedLink = page.getByRole('link', { name: 'Get started' });
  }

  async navigateToQaUrl() {
    const qaUrl = process.env.BASE_URL || 'https://mpncloudehr.eclipseehrcloud.net/';
    await this.page.goto(qaUrl);
  }

  async navigateToHome() {
    await this.page.goto('/');
  }

  async clickGetStarted() {
    await this.getStartedLink.click();
  }

  isIdentityProviderPage() {
    return /b2clogin\.com/i.test(this.page.url());
  }

  async hasLoginFormVisible(timeout = 15_000) {
    try {
      await this.usernameInput.waitFor({ state: 'visible', timeout });
      return true;
    } catch {
      return false;
    }
  }

  async signIn(username, password) {
    if (typeof username !== 'string' || !username.trim()) {
      throw new Error('signIn: username is missing. Set LOGIN_USERNAME in .env.qa');
    }
    if (typeof password !== 'string' || !password.trim()) {
      throw new Error('signIn: password is missing. Set LOGIN_PASSWORD in .env.qa');
    }

    await this.usernameInput.waitFor({ state: 'visible', timeout: 60_000 });
    await this.passwordInput.waitFor({ state: 'visible', timeout: 60_000 });
    await this.signInButton.waitFor({ state: 'visible', timeout: 60_000 });
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
    await this.signInButton.click();
  }

  async ensureLoggedInWithEnvCredentials() {
    await this.navigateToQaUrl();

    const loginFormVisible = await this.hasLoginFormVisible();
    if (loginFormVisible || this.isIdentityProviderPage()) {
      await this.signIn(process.env.LOGIN_USERNAME, process.env.LOGIN_PASSWORD);
    }

    await this.verifyLoggedIn();
  }

  async verifyLoggedIn() {
    await expect(this.page).toHaveURL(/mpncloudehr\.eclipseehrcloud\.net/i, { timeout: 60_000 });
    await expect(this.page).not.toHaveURL(/b2clogin\.com/i, { timeout: 60_000 });
  }

  async verifyLoginPageVisible() {
    await expect(this.usernameInput).toBeVisible({ timeout: 10_000 });
    await expect(this.passwordInput).toBeVisible({ timeout: 10_000 });
    await expect(this.signInButton).toBeVisible({ timeout: 10_000 });
  }
}
