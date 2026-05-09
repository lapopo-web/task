const { test, expect } = require('@playwright/test');
const { resetDb, apiSignup } = require('./helpers');

const user1 = { name: 'Alice', email: 'alice@tasks.e2e', password: 'password123', organizationName: 'Org One' };
const user2 = { name: 'Bob', email: 'bob@tasks.e2e', password: 'password123', organizationName: 'Org Two' };

test.beforeEach(async () => {
  await resetDb();
  await apiSignup(user1);
  await apiSignup(user2);
});

async function loginAs(page, user) {
  await page.goto('/');
  await page.getByLabel('Email').fill(user.email);
  await page.getByLabel('Password').fill(user.password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page.getByText('TaskFlow')).toBeVisible();
}

test('creates a task and it appears in the list', async ({ page }) => {
  await loginAs(page, user1);

  await page.getByRole('button', { name: '+ New Task' }).click();
  await page.getByLabel('Title').fill('My first task');
  await page.getByRole('button', { name: 'Create Task' }).click();

  await expect(page.getByText('My first task')).toBeVisible();
});

test('shows validation error when title is empty', async ({ page }) => {
  await loginAs(page, user1);

  await page.getByRole('button', { name: '+ New Task' }).click();
  await page.getByRole('button', { name: 'Create Task' }).click();

  await expect(page.getByRole('alert')).toBeVisible();
  await expect(page.getByText('Title is required')).toBeVisible();
});

test('updates task status via select', async ({ page }) => {
  await loginAs(page, user1);

  await page.getByRole('button', { name: '+ New Task' }).click();
  await page.getByLabel('Title').fill('Status test task');
  await page.getByRole('button', { name: 'Create Task' }).click();
  await expect(page.getByText('Status test task')).toBeVisible();

  const card = page.locator('article').filter({ hasText: 'Status test task' });
  await card.getByRole('combobox', { name: /Status/ }).selectOption('in_progress');

  await expect(card.getByRole('combobox')).toHaveValue('in_progress');
});

test('deletes a task — it disappears from list', async ({ page }) => {
  await loginAs(page, user1);

  await page.getByRole('button', { name: '+ New Task' }).click();
  await page.getByLabel('Title').fill('Task to delete');
  await page.getByRole('button', { name: 'Create Task' }).click();
  await expect(page.getByText('Task to delete')).toBeVisible();

  page.once('dialog', (dialog) => dialog.accept());
  await page.locator('article').filter({ hasText: 'Task to delete' }).getByRole('button', { name: 'Delete task' }).click();

  await expect(page.getByText('Task to delete')).not.toBeVisible();
});

test('cross-tenant isolation — org2 cannot see org1 tasks', async ({ page, context }) => {
  await loginAs(page, user1);
  await page.getByRole('button', { name: '+ New Task' }).click();
  await page.getByLabel('Title').fill('Secret Org1 Task');
  await page.getByRole('button', { name: 'Create Task' }).click();
  await expect(page.getByText('Secret Org1 Task')).toBeVisible();

  const page2 = await context.newPage();
  await loginAs(page2, user2);
  await expect(page2.getByText('Secret Org1 Task')).not.toBeVisible();
  await page2.close();
});
