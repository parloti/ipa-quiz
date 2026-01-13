import { expect, test } from '@playwright/test';

test('homepage loads and shows login', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveTitle(/IpaQuiz/i);
  // Check that the login view renders a Google sign-in button
  await expect(page.locator('text=Sign in with Google')).toBeVisible();
});
