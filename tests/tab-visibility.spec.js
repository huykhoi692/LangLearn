import { test, expect } from '@playwright/test';
import { KEY, setupPage, basePlan } from './helpers';

test('Reading chỉ hiển thị ở tab Luyện tập khi skill Reading active', async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10);
  const plan = basePlan();
  plan.checklist = [{ label: 'Reading hôm nay', duration: 20 }, { label: 'Listening hôm nay', duration: 20 }];

  await setupPage(page, {
    settings: { apiKey: '', model: 'gemini-1.5-flash' },
    phase: 'phase1',
    days: { [today]: { plan, tasks: plan.checklist.map(t => ({ ...t, done: false })) } }
  });

  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Reading' })).toBeHidden();
  await page.getByRole('button', { name: 'Sổ tay' }).click();
  await expect(page.getByRole('heading', { name: 'Reading' })).toBeHidden();
  await page.getByRole('button', { name: 'Cài đặt' }).click();
  await expect(page.getByRole('heading', { name: 'Reading' })).toBeHidden();

  await page.getByRole('button', { name: 'Luyện tập' }).click();
  await expect(page.locator('[data-skill-pane="reading"]')).toHaveClass(/active-skill/);
  await expect(page.getByRole('heading', { name: 'Reading' })).toBeVisible();

  const saved = await page.evaluate((key) => JSON.parse(localStorage.getItem(key)), KEY);
  expect(saved.settings.apiKey).toBe('');
});
