import { test } from '../../framework/fixtures/baseFixture.js';

test.describe('Login module', () => {
  test('Auto login runs for this test', async ({ loginPage }) => {
    await loginPage.verifyLoggedIn();
  });
});
