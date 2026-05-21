import { test, expect } from '@playwright/test';
import { setupPage, basePlan, localDateKey } from './helpers';

const baseState = { settings: { apiKey: '', model: 'gemini-1.5-flash' }, phase: 'phase1' };

test('Hero CTA: chưa có plan chỉ hiện Tạo kế hoạch hôm nay', async ({ page }) => {
  const today = localDateKey();
  await setupPage(page, { ...baseState, days: { [today]: { plan: null, tasks: [] } } });
  await page.goto('/');

  await expect(page.locator('#hero-cta-row')).toContainText('Tạo kế hoạch hôm nay');
  await expect(page.locator('#hero-cta-row')).not.toContainText('Tiếp tục:');
  await expect(page.locator('#hero-cta-row')).not.toContainText('Xem sổ tay');
});

test('Hero CTA: có task chưa done hiện Tiếp tục: [task]', async ({ page }) => {
  const today = localDateKey();
  const plan = basePlan();
  plan.checklist = [
    { label: 'Reading hôm nay', duration: 20 },
    { label: 'Listening hôm nay', duration: 20 }
  ];
  await setupPage(page, { ...baseState, days: { [today]: { plan, tasks: plan.checklist.map(t => ({ ...t, done: false })) } } });
  await page.goto('/');

  await expect(page.locator('#hero-cta-row')).toContainText('Tiếp tục: Reading hôm nay');
});

test('Hero CTA: done hết hiện Xem sổ tay và click mở tab Sổ tay', async ({ page }) => {
  const today = localDateKey();
  const plan = basePlan();
  plan.checklist = [{ label: 'Reading hôm nay', duration: 20 }];
  await setupPage(page, { ...baseState, days: { [today]: { plan, tasks: [{ label: 'Reading hôm nay', duration: 20, done: true }] } } });
  await page.goto('/');

  const cta = page.getByRole('button', { name: 'Xem sổ tay' });
  await expect(cta).toBeVisible();
  await cta.click();
  await expect(page.getByRole('button', { name: 'Sổ tay' })).toHaveClass(/active/);
});
