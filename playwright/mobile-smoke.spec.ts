import { test, expect } from '@playwright/test';

test('mobile toolbar renders and key buttons are visible', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Survivor Tier Ranking Pro/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Quick Rank/i })).toBeVisible();
  await expect(page.getByRole('button', { name: /Compare/i })).toBeVisible();
});
