import { expect, test } from '@playwright/test'

test('login page renders', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByText('Welcome back')).toBeVisible()
})

test('register page can open', async ({ page }) => {
  await page.goto('/')
  await page.getByText('Sign up').click()
  await expect(page.getByText('Create an account')).toBeVisible()
})
