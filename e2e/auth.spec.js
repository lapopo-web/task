const { test, expect } = require('@playwright/test');
const { resetDb } = require('./helpers');

const user = {
  name: 'Alice E2E',
  email: 'alice-e2e@example.com',
  password: 'password123',
  organizationName: 'E2E Org',
};

test.beforeEach(async () => {
  await resetDb();
});

test('signup creates account and shows task board', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Sign up' }).click();

  await page.getByLabel('Full name').fill(user.name);
  await page.getByLabel('Organization name').fill(user.organizationName);
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);

  await page.getByRole('button', { name: 'Create account' }).click();

  await expect(page.getByText('TaskFlow')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Tasks' })).toBeVisible();
});

test('login with valid credentials succeeds', async ({ page }) => {
  const { resetDb: reset, apiSignup } = require('./helpers');
  await apiSignup(user).catch(() => null);

  await page.goto('/');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByText('TaskFlow')).toBeVisible();
});

test('login with wrong password shows error', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill('wrongpassword');
  await page.getByRole('button', { name: 'Sign in' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
});

test('logout redirects to login page', async ({ page }) => {
  const { apiSignup } = require('./helpers');
  await apiSignup(user).catch(() => null);

  await page.goto('/');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();

  await page.getByRole('button', { name: 'Logout' }).click();
  await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
});
