import { test } from '@playwright/test'

test('Debug: Capture homepage structure', async ({ page }) => {
  await page.goto('/')
  await page.waitForTimeout(3000)
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/homepage.png', fullPage: true })
  
  // Log page content
  const html = await page.content()
  console.log('=== PAGE HTML ===')
  console.log(html.substring(0, 2000))
  
  // Log all input fields
  const inputs = await page.locator('input').all()
  console.log('\n=== INPUT FIELDS ===')
  for (const input of inputs) {
    const type = await input.getAttribute('type')
    const name = await input.getAttribute('name')
    const id = await input.getAttribute('id')
    const placeholder = await input.getAttribute('placeholder')
    console.log(`Input: type=${type}, name=${name}, id=${id}, placeholder=${placeholder}`)
  }
  
  // Log all buttons
  const buttons = await page.locator('button').all()
  console.log('\n=== BUTTONS ===')
  for (const button of buttons) {
    const text = await button.textContent()
    const type = await button.getAttribute('type')
    console.log(`Button: text="${text?.trim()}", type=${type}`)
  }
  
  // Log all links
  const links = await page.locator('a').all()
  console.log('\n=== LINKS ===')
  for (const link of links) {
    const text = await link.textContent()
    const href = await link.getAttribute('href')
    console.log(`Link: text="${text?.trim()}", href=${href}`)
  }
})

test('Debug: Capture dashboard structure (if accessible)', async ({ page }) => {
  await page.goto('/dashboard')
  await page.waitForTimeout(3000)
  
  // Take screenshot
  await page.screenshot({ path: 'test-results/dashboard.png', fullPage: true })
  
  console.log('=== DASHBOARD URL ===')
  console.log(page.url())
  
  // Log navigation items
  const navItems = await page.locator('nav a, [role="navigation"] a').all()
  console.log('\n=== NAVIGATION ITEMS ===')
  for (const item of navItems) {
    const text = await item.textContent()
    const href = await item.getAttribute('href')
    console.log(`Nav: text="${text?.trim()}", href=${href}`)
  }
})
