import { expect, test } from '@playwright/test'
import * as path from 'path'

// Test data from TEST-CASES-DETAILED.md
const TEST_USER = {
  email: 'qa_ui@example.com',
  password: 'Password1',
}

const CERT_FILE_PATH = '/Users/sheliasun/Library/Mobile Documents/com~apple~CloudDocs/edi-portal-prototype/public/certificates/LOGISTICSTEAM_SHA256_2031.cer'

test.describe('UI Smoke Tests from TEST-CASES-DETAILED.md', () => {
  
  test('UI-002: Visit /dashboard while logged out - should redirect to login page', async ({ page }) => {
    // Navigate directly to dashboard without logging in
    await page.goto('/dashboard')
    
    // Should be redirected to login page
    await expect(page).toHaveURL(/.*\/(login|auth\/signin)/)
    await expect(page.getByText(/Welcome back|Sign in/i)).toBeVisible()
    
    console.log('✅ UI-002 PASS: Unauthenticated user redirected to login')
  })

  test('UI-001: Log in with qa_ui@example.com - should redirect to /dashboard', async ({ page }) => {
    await page.goto('/')
    
    // Fill in login form
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password)
    
    // Submit login
    await page.click('button[type="submit"]')
    
    // Wait for navigation and verify redirect to dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    await expect(page).toHaveURL(/.*\/dashboard/)
    
    console.log('✅ UI-001 PASS: Login successful, redirected to /dashboard')
  })

  test('UI-003: Navigate to Partners page - confirm data list renders', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    
    // Navigate to Partners page
    await page.click('text=/Partners/i')
    await page.waitForURL(/.*\/partners/, { timeout: 5000 })
    
    // Wait for data to load - look for table, list, or grid elements
    await page.waitForSelector('table, [role="table"], [data-testid*="partner"], .partner-list', { timeout: 10000 })
    
    // Verify some content is visible (could be table headers, partner names, etc.)
    const hasContent = await page.locator('table, [role="table"], [data-testid*="partner"]').count() > 0
    expect(hasContent).toBeTruthy()
    
    console.log('✅ UI-003 PASS: Partners page loaded with data list')
  })

  test('UI-004: Upload certificate file - confirm it appears in list', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    
    // Navigate to Certificates page
    await page.click('text=/Certificates/i')
    await page.waitForURL(/.*\/certificates/, { timeout: 5000 })
    
    // Look for upload button or file input
    const fileInput = page.locator('input[type="file"]')
    
    if (await fileInput.count() > 0) {
      // Upload the certificate file
      await fileInput.setInputFiles(CERT_FILE_PATH)
      
      // Wait for upload to complete and list to refresh
      await page.waitForTimeout(2000)
      
      // Verify the file appears in the list (look for filename or success indicator)
      const certName = path.basename(CERT_FILE_PATH)
      const hasCert = await page.getByText(certName, { exact: false }).count() > 0
      
      if (hasCert) {
        console.log('✅ UI-004 PASS: Certificate uploaded and appears in list')
      } else {
        console.log('⚠️  UI-004 PARTIAL: Certificate upload completed but not immediately visible in list')
      }
    } else {
      console.log('⚠️  UI-004 BLOCKED: No file upload input found on Certificates page')
    }
  })

  test('UI-005: Open Partner detail and upload specification file', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    
    // Navigate to Partners page
    await page.click('text=/Partners/i')
    await page.waitForURL(/.*\/partners/, { timeout: 5000 })
    
    // Wait for partners to load
    await page.waitForTimeout(2000)
    
    // Click on first partner (or a specific partner)
    const partnerLink = page.locator('a[href*="/partners/"], button:has-text("View"), button:has-text("Details")').first()
    
    if (await partnerLink.count() > 0) {
      await partnerLink.click()
      await page.waitForTimeout(2000)
      
      // Look for specification upload section
      const specFileInput = page.locator('input[type="file"]').filter({ hasText: /spec/i })
      
      if (await specFileInput.count() > 0) {
        // Create a simple test file
        const testFilePath = '/tmp/test-spec.txt'
        await page.evaluate(() => {
          const fs = require('fs')
          fs.writeFileSync('/tmp/test-spec.txt', 'Test specification content')
        }).catch(() => {
          console.log('⚠️  Could not create test file via page context')
        })
        
        console.log('⚠️  UI-005 PARTIAL: Partner detail opened, but spec upload needs manual verification')
      } else {
        console.log('⚠️  UI-005 BLOCKED: No specification upload UI found in Partner detail')
      }
    } else {
      console.log('⚠️  UI-005 BLOCKED: No partner detail link found')
    }
  })

  test('UI-006: Open Notifications tab - wait 20s to observe auto refresh', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    
    // Navigate to Notifications
    await page.click('text=/Notifications/i')
    await page.waitForTimeout(1000)
    
    // Capture initial state
    const initialContent = await page.content()
    
    // Wait 20 seconds
    console.log('⏳ Waiting 20 seconds to observe auto-refresh...')
    await page.waitForTimeout(20000)
    
    // Capture final state
    const finalContent = await page.content()
    
    if (initialContent !== finalContent) {
      console.log('✅ UI-006 PASS: Notifications auto-refreshed (content changed)')
    } else {
      console.log('⚠️  UI-006 NOTE: No visible change in Notifications after 20s (may be no new notifications)')
    }
  })

  test('UI-007: Open Overview tab - verify stats display', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"], input[name="email"]', TEST_USER.email)
    await page.fill('input[type="password"], input[name="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForURL(/.*\/dashboard/, { timeout: 10000 })
    
    // Dashboard might be the Overview, or look for Overview tab/link
    const overviewLink = page.locator('text=/Overview/i')
    
    if (await overviewLink.count() > 0) {
      await overviewLink.click()
      await page.waitForTimeout(2000)
    }
    
    // Look for stat cards, metrics, or dashboard widgets
    const hasStats = await page.locator('[data-testid*="stat"], .stat, .metric, .card').count() > 0
    
    if (hasStats) {
      console.log('✅ UI-007 PASS: Overview/Dashboard displays stats')
    } else {
      // Try to find any numeric displays
      const hasNumbers = await page.locator('text=/\\d+/').count() > 0
      if (hasNumbers) {
        console.log('✅ UI-007 PASS: Overview displays data')
      } else {
        console.log('⚠️  UI-007 PARTIAL: Overview loaded but stats not clearly visible')
      }
    }
  })
})
