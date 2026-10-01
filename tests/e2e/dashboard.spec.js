import { test as base, expect } from '@playwright/test';

const test = base.extend({
  page: async ({ page }, use) => {
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    // It is still September 30 in the browser's configured US time zone.
    // The dashboard must nevertheless use October 1 in Asia/Seoul.
    await page.clock.install({ time: new Date('2026-10-01T04:00:00Z') });
    await use(page);
    expect(errors, 'The app must not raise browser runtime errors').toEqual([]);
  },
});

async function navigate(page, name) {
  const button = page.getByRole('navigation').getByRole('button', { name, exact: true });
  await button.click();
  await expect(button).toHaveAttribute('aria-current', 'page');
}

test('opens today in KST with a calculated day pillar and all three summaries', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByTestId('analysis-date')).toContainText(/2026[.\s]+10[.\s]+01/);
  await expect(page.getByTestId('day-ganzi')).toContainText('戊申');
  const content = page.locator('#content');
  await expect(content.getByRole('heading', { name: '은서', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: '하나', exact: true })).toBeVisible();
  await expect(content.getByRole('heading', { name: '둘의 흐름', exact: true })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('button')).toHaveCount(4);
});

test('calendar selects September 30 and changes analysis without leaving the calendar', async ({ page }) => {
  await page.goto('/');
  await navigate(page, '달력');
  await page.getByRole('button', { name: '이전 달', exact: true }).click();
  await page.getByRole('button', { name: '2026년 9월 30일 丁未', exact: true }).click();
  await expect(page.getByTestId('analysis-date')).toContainText(/2026[.\s]+09[.\s]+30/);
  await expect(page.getByTestId('day-ganzi')).toContainText('丁未');
  await expect(page.getByRole('navigation').getByRole('button', { name: '달력', exact: true }))
    .toHaveAttribute('aria-current', 'page');
  await expect(page.locator('#content')).toContainText('정재');
  await expect(page.locator('#content')).toContainText('정관');
  const selectedAnalysis = await page.locator('#content').innerText();
  await page.getByRole('button', { name: '2026년 9월 29일 丙午', exact: true }).click();
  await expect(page.getByTestId('day-ganzi')).toContainText('丙午');
  await page.getByRole('button', { name: '2026년 9월 30일 丁未', exact: true }).click();
  expect(await page.locator('#content').innerText()).toBe(selectedAnalysis);
});

test('calendar is restricted to the preceding, current and following months', async ({ page }) => {
  await page.goto('/');
  await navigate(page, '달력');
  const previous = page.getByRole('button', { name: '이전 달', exact: true });
  const next = page.getByRole('button', { name: '다음 달', exact: true });
  await expect(previous).toBeEnabled();
  await expect(next).toBeEnabled();
  await previous.click();
  await expect(previous).toBeDisabled();
  await expect(page.getByRole('button', { name: '2026년 9월 30일 丁未', exact: true })).toBeVisible();
  await next.click();
  await expect(previous).toBeEnabled();
  await next.click();
  await expect(next).toBeDisabled();
  await expect(page.getByRole('button', { name: /^2026년 11월 1일 / })).toBeVisible();
});

test('date and both month ranges move forward at the Korean month boundary', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-10-31T15:00:00Z'));
  await page.goto('/');
  await expect(page.getByTestId('analysis-date')).toContainText(/2026[.\s]+11[.\s]+01/);
  await navigate(page, '달력');
  await page.getByRole('button', { name: '이전 달', exact: true }).click();
  await expect(page.getByRole('button', { name: '이전 달', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '2026년 10월 1일 戊申', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '다음 달', exact: true }).click();
  await page.getByRole('button', { name: '다음 달', exact: true }).click();
  await expect(page.getByRole('button', { name: '다음 달', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: /^2026년 12월 1일 / })).toBeVisible();
  await navigate(page, '월운');
  const months = page.locator('details.month-item');
  await expect(months).toHaveCount(4);
  await expect(months.first().locator(':scope > summary')).toContainText(/2026[.\s]+11/);
  await expect(months.last().locator(':scope > summary')).toContainText(/2027[.\s]+02/);
});

test('an open tab refreshes automatically when KST crosses midnight into a new month', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-10-31T14:59:45Z'));
  await page.goto('/');
  await expect(page.getByTestId('analysis-date')).toContainText(/2026[.\s]+10[.\s]+31/);
  await page.clock.fastForward(30_000);
  await expect(page.getByTestId('analysis-date')).toContainText(/2026[.\s]+11[.\s]+01/);
  await navigate(page, '달력');
  await page.getByRole('button', { name: '이전 달', exact: true }).click();
  await expect(page.getByRole('button', { name: '이전 달', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: '2026년 10월 1일 戊申', exact: true })).toBeVisible();
});

test('navigation just after midnight works before the next periodic clock refresh', async ({ page }) => {
  await page.clock.setSystemTime(new Date('2026-10-31T14:59:58Z'));
  await page.goto('/');
  await page.clock.fastForward(4_000);
  await navigate(page, '달력');
  await expect(page.getByTestId('analysis-date')).toContainText(/2026[.\s]+11[.\s]+01/);
});

test('month view spans four months across the year and opens detailed interpretations', async ({ page }) => {
  await page.goto('/');
  await navigate(page, '월운');
  const months = page.locator('details.month-item');
  await expect(months).toHaveCount(4);
  const expected = [/2026[.\s]+10/, /2026[.\s]+11/, /2026[.\s]+12/, /2027[.\s]+01/];
  for (let index = 0; index < expected.length; index += 1) {
    await expect(months.nth(index).locator(':scope > summary')).toContainText(expected[index]);
  }
  await months.first().locator(':scope > summary').click();
  await expect(months.first()).toHaveAttribute('open', '');
  await expect(months.first().getByRole('heading', { name: '은서', exact: true })).toBeVisible();
  await expect(months.first().getByRole('heading', { name: '하나', exact: true })).toBeVisible();
  await expect(months.first().getByRole('heading', { name: '둘의 흐름', exact: true })).toBeVisible();
  await expect(months.first()).toContainText('子午');
  await expect(months.first()).toContainText('子丑');
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
    await page.evaluate(() => window.innerWidth),
  );
  // Hanro starts after noon (15:29 KST) on this date: status must use now.
  await page.clock.setSystemTime(new Date('2026-10-08T07:00:00Z'));
  await page.reload();
  await expect(page.locator('details.month-item').first().locator('.month-state')).toHaveText('진행 중');
});

test('base displays only Hana’s three known pillars and the relationship foundations', async ({ page }) => {
  await page.goto('/');
  await navigate(page, '기본');
  const hana = page.getByTestId('person-hana-pillars');
  await expect(hana.locator('[data-pillar]')).toHaveCount(3);
  await expect(hana.locator('[data-pillar="hour"]')).toHaveCount(0);
  const dayColumn = await hana.locator('thead th').evaluateAll((headers) =>
    headers.findIndex((header) => header.dataset.pillar === 'day'),
  );
  expect(dayColumn).toBeGreaterThanOrEqual(0);
  await expect(hana.locator('tbody tr').nth(0).locator('td').nth(dayColumn)).toHaveText('庚');
  await expect(hana.locator('tbody tr').nth(1).locator('td').nth(dayColumn)).toHaveText('午');
  await expect(page.locator('#content')).toContainText('출생시간 미상');
  await expect(page.locator('#content')).toContainText('金生水');
  await expect(page.locator('#content')).toContainText('子午');
  await expect(page.locator('#content')).toContainText('편인');
  await expect(page.locator('#content')).toContainText('식신');
});

test('each hash route survives reload and fits the viewport', async ({ page }) => {
  await page.goto('/');
  for (const name of ['달력', '월운', '기본', '오늘']) {
    await navigate(page, name);
    const url = page.url();
    await page.reload();
    expect(page.url()).toBe(url);
    await expect(page.getByRole('navigation').getByRole('button', { name, exact: true }))
      .toHaveAttribute('aria-current', 'page');
    await expect(page.locator('#content')).not.toBeEmpty();
    const widths = await page.evaluate(() => ({
      document: document.documentElement.scrollWidth,
      viewport: window.innerWidth,
    }));
    expect(widths.document, `${name} must not cause horizontal scrolling`).toBeLessThanOrEqual(widths.viewport);
  }
});

test('production assets are relative and load successfully for GitHub Pages', async ({ page }) => {
  const failedRequests = [];
  page.on('requestfailed', (request) => failedRequests.push(request.url()));
  page.on('response', (response) => {
    if (response.status() >= 400) failedRequests.push(`${response.status()} ${response.url()}`);
  });
  await page.goto('/');
  await expect(page.getByTestId('day-ganzi')).toContainText('戊申');
  const paths = await page.locator('script[src], link[rel="stylesheet"][href]').evaluateAll((elements) =>
    elements.map((element) => element.getAttribute('src') || element.getAttribute('href')),
  );
  expect(paths.length).toBeGreaterThanOrEqual(2);
  for (const path of paths) expect(path).toMatch(/^\.\/assets\//);
  expect(failedRequests).toEqual([]);
});
