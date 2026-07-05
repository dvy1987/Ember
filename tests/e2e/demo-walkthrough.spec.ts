import { test, expect } from '@playwright/test';

/**
 * Happy path: demo walkthrough → train → reflect → complete → resume.
 * Requires api-server (8080) + ember dev (5000) running.
 */
test('demo sacred loop completes end-to-end', async ({ page }) => {
  await page.goto('/?demo=1');

  await expect(page.getByText(/walkthrough|demo/i).first()).toBeVisible({ timeout: 20_000 });

  const trainButton = page.getByRole('button', { name: /train/i }).first();
  await expect(trainButton).toBeVisible({ timeout: 20_000 });
  await trainButton.click();

  await expect(
    page.getByText(/focusing|training|timer/i).first(),
  ).toBeVisible({ timeout: 20_000 });

  await expect(
    page.getByText(/training complete|what did you tend|reflect/i).first(),
  ).toBeVisible({ timeout: 90_000 });

  const rememberButton = page.getByRole('button', { name: /remember this session|skip for now/i }).first();
  await rememberButton.click();

  await expect(
    page.getByText(/well tended|remembered|your dragon remembers/i).first(),
  ).toBeVisible({ timeout: 30_000 });

  const seeResume = page.getByRole('link', { name: /see resume/i });
  if (await seeResume.isVisible()) {
    await seeResume.click();
    await expect(page.getByText(/your dragon remembers|what your dragon holds/i).first()).toBeVisible({
      timeout: 20_000,
    });
  }
});
