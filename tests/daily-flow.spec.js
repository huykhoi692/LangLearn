import { test, expect } from '@playwright/test';
import { setupPage, basePlan } from './helpers';

test('Flow Reading -> chấm -> đánh dấu hoàn thành -> next task Listening', async ({ page }) => {
  const today = new Date().toISOString().slice(0, 10);
  const plan = basePlan();
  plan.checklist = [
    { label: 'Reading hôm nay', duration: 20 },
    { label: 'Listening hôm nay', duration: 20 }
  ];

  await setupPage(page, {
    settings: { apiKey: '', model: 'gemini-1.5-flash' },
    phase: 'phase1',
    days: { [today]: { plan, tasks: plan.checklist.map(t => ({ ...t, done: false })) } }
  });

  await page.goto('/');
  await page.getByRole('button', { name: 'Luyện tập' }).click();

  await page.locator('.reading-input').first().fill('alpha');
  await page.locator('.reading-input').nth(1).fill('beta');
  await page.locator('.reading-input').nth(2).fill('gamma');
  await page.getByRole('button', { name: 'Chấm Reading' }).click();
  await expect(page.locator('#reading-feedback')).toContainText('Reading: 3/3');

  await page.locator('#reading-feedback .mark-skill-done').click();

  await page.getByRole('button', { name: 'Hôm nay' }).click();
  await expect(page.locator('#next-task')).toContainText('Listening hôm nay');

  await page.getByRole('button', { name: 'Bắt đầu' }).click();
  await expect(page.getByRole('button', { name: 'Luyện tập' })).toHaveClass(/active/);
  await expect(page.locator('[data-skill-pane="listening"]')).toHaveClass(/active-skill/);
  await expect(page.getByRole('heading', { name: 'Listening' })).toBeVisible();
});
