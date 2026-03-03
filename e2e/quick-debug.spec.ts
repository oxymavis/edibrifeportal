import { test } from '@playwright/test'

test('Quick debug: Check what happens after UI-002', async ({ page }) => {
  // Clear cookies
  await page.context().clearCookies()
  
  // Visit dashboard (UI-002)
  await page.goto('/dashboard')
  await page.waitForTimeout(2000)
  console.log('After /dashboard:', page.url())
  await page.screenshot({ path: 'test-results/debug-after-dashboard.png' })
  
  // Now try to go to login
  await page.goto('/')
  await page.waitForTimeout(2000)
  console.log('After /:', page.url())
  await page.screenshot({ path: 'test-results/debug-after-root.png' })
  
  // Check what's on the page
  const emailInput = await page.locator('input[type="email"]').count()
  console.log('Email inputs found:', emailInput)
  
  const allInputs = await page.locator('input').all()
  console.log('All inputs:')
  for (const input of allInputs) {
    const type = await input.getAttribute('type')
    const visible = await input.isVisible().catch(() => false)
    console.log(`  - type=${type}, visible=${visible}`)
  }
})
