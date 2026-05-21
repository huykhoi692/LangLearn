import { test, expect } from '@playwright/test';
import { setupPage, basePlan } from './helpers';

test('Sổ tay: nút hoàn thành tick đúng task từ vựng/ngữ pháp', async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10);
  const plan = basePlan();
  plan.checklist = [
    { label: 'Từ vựng hôm nay', duration: 15 },
    { label: 'Ngữ pháp hôm nay', duration: 15 }
  ];

  await setupPage(page, {
    settings: { apiKey: '', model: 'gemini-1.5-flash' },
    phase: 'phase1',
    days: { [today]: { plan, tasks: plan.checklist.map(t => ({ ...t, done: false })) } }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Sổ tay' }).click();

  await page.getByRole('button', { name: 'Đánh dấu Vocabulary hoàn thành' }).click();
  await page.getByRole('button', { name: 'Đánh dấu Grammar hoàn thành' }).click();

  await page.getByRole('button', { name: 'Hôm nay' }).click();
  const checks = page.locator('#daily-checklist input[type="checkbox"]');
  await expect(checks.first()).toBeChecked();
  await expect(checks.nth(1)).toBeChecked();
});
