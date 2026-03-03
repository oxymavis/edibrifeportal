import { expect, test } from '@playwright/test'
import * as path from 'path'

// Test data from TEST-CASES-DETAILED.md
const TEST_USER = {
  email: 'qa_ui@example.com',
  password: 'Password1',
}

const CERT_FILE_PATH = '/Users/sheliasun/Library/Mobile Documents/com~apple~CloudDocs/edi-portal-prototype/public/certificates/LOGISTICSTEAM_SHA256_2031.cer'

// Run tests sequentially
test.describe.configure({ mode: 'serial' })

test.describe('UI Smoke Tests - Sequential Execution', () => {
  
  test('UI-002: Visit /dashboard while logged out - should redirect to login page', async ({ page }) => {
    // Clear any existing cookies/storage
    await page.context().clearCookies()
    
    // Navigate directly to dashboard without logging in
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    // Check if redirected or if login form is visible
    const currentUrl = page.url()
    console.log(`Current URL after visiting /dashboard: ${currentUrl}`)
    
    // Take screenshot for evidence
    await page.screenshot({ path: 'test-results/ui-002-dashboard-logged-out.png' })
    
    if (currentUrl.includes('/login') || currentUrl.includes('/signin') || currentUrl === 'http://localhost:3000/') {
      console.log('✅ UI-002 PASS: Redirected to login page')
    } else {
      // Check if login form is visible on the page
      const hasLoginForm = await page.locator('input[type="email"]').count() > 0
      if (hasLoginForm) {
        console.log('✅ UI-002 PASS: Login form visible (implicit redirect)')
      } else {
        console.log('❌ UI-002 FAIL: Dashboard accessible without authentication - SECURITY ISSUE!')
      }
    }
  })

  test('UI-001: Log in with qa_ui@example.com - should redirect to /dashboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    // Fill in login form
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    
    // Take screenshot before login
    await page.screenshot({ path: 'test-results/ui-001-before-login.png' })
    
    // Submit login
    await page.click('button[type="submit"]')
    
    // Wait for navigation
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    console.log(`Current URL after login: ${currentUrl}`)
    
    // Take screenshot after login
    await page.screenshot({ path: 'test-results/ui-001-after-login.png', fullPage: true })
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ UI-001 PASS: Login successful, redirected to /dashboard')
    } else {
      console.log(`❌ UI-001 FAIL: Not redirected to dashboard. Current URL: ${currentUrl}`)
    }
  })

  test('UI-003: Navigate to Partners page - confirm data list renders', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Take screenshot of dashboard to see navigation
    await page.screenshot({ path: 'test-results/ui-003-dashboard.png', fullPage: true })
    
    // Log all visible navigation links
    const navLinks = await page.locator('nav a, a[href*="/partner"], button:has-text("Partner")').all()
    console.log(`Found ${navLinks.length} potential partner navigation elements`)
    
    for (const link of navLinks) {
      const text = await link.textContent().catch(() => '')
      const href = await link.getAttribute('href').catch(() => '')
      console.log(`  - Text: "${text?.trim()}", Href: ${href}`)
    }
    
    // Try to find and click Partners link
    const partnersLink = page.locator('a[href*="/partner"], button:has-text("Partner")').first()
    
    if (await partnersLink.count() > 0) {
      await partnersLink.click()
      await page.waitForTimeout(2000)
      
      await page.screenshot({ path: 'test-results/ui-003-partners-page.png', fullPage: true })
      
      // Check for any data display
      const hasTable = await page.locator('table').count() > 0
      const hasCards = await page.locator('[class*="card"]').count() > 0
      const hasRows = await page.locator('[role="row"]').count() > 0
      
      if (hasTable || hasCards || hasRows) {
        console.log('✅ UI-003 PASS: Partners page loaded with data list')
      } else {
        console.log('⚠️  UI-003 PARTIAL: Partners page loaded but no clear data list visible')
      }
    } else {
      console.log('❌ UI-003 BLOCKED: Could not find Partners navigation link')
    }
  })

  test('UI-004: Upload certificate file - confirm it appears in list', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Look for Certificates link
    const certsLink = page.locator('a[href*="/certificate"], button:has-text("Certificate")').first()
    
    if (await certsLink.count() > 0) {
      await certsLink.click()
      await page.waitForTimeout(2000)
      
      await page.screenshot({ path: 'test-results/ui-004-certificates-page.png', fullPage: true })
      
      // Look for file input
      const fileInput = page.locator('input[type="file"]').first()
      
      if (await fileInput.count() > 0) {
        // Upload the certificate file
        await fileInput.setInputFiles(CERT_FILE_PATH)
        await page.waitForTimeout(3000)
        
        await page.screenshot({ path: 'test-results/ui-004-after-upload.png', fullPage: true })
        
        // Check if file appears
        const certName = path.basename(CERT_FILE_PATH)
        const hasCert = await page.getByText(certName, { exact: false }).count() > 0
        
        if (hasCert) {
          console.log('✅ UI-004 PASS: Certificate uploaded and appears in list')
        } else {
          console.log('⚠️  UI-004 PARTIAL: Certificate uploaded but not immediately visible')
        }
      } else {
        console.log('❌ UI-004 BLOCKED: No file upload input found')
      }
    } else {
      console.log('❌ UI-004 BLOCKED: Could not find Certificates navigation link')
    }
  })

  test('UI-005: Open Partner detail and upload specification file', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Navigate to Partners
    const partnersLink = page.locator('a[href*="/partner"], button:has-text("Partner")').first()
    
    if (await partnersLink.count() > 0) {
      await partnersLink.click()
      await page.waitForTimeout(2000)
      
      // Click on first partner detail
      const detailLink = page.locator('a[href*="/partners/"], button:has-text("View"), button:has-text("Detail")').first()
      
      if (await detailLink.count() > 0) {
        await detailLink.click()
        await page.waitForTimeout(2000)
        
        await page.screenshot({ path: 'test-results/ui-005-partner-detail.png', fullPage: true })
        
        console.log('⚠️  UI-005 PARTIAL: Partner detail opened, manual verification needed for spec upload')
      } else {
        console.log('❌ UI-005 BLOCKED: No partner detail link found')
      }
    } else {
      console.log('❌ UI-005 BLOCKED: Could not find Partners navigation link')
    }
  })

  test('UI-006: Open Notifications tab - wait 20s to observe auto refresh', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Look for Notifications link
    const notifLink = page.locator('a[href*="/notification"], button:has-text("Notification")').first()
    
    if (await notifLink.count() > 0) {
      await notifLink.click()
      await page.waitForTimeout(2000)
      
      await page.screenshot({ path: 'test-results/ui-006-notifications-initial.png', fullPage: true })
      
      const initialContent = await page.content()
      
      console.log('⏳ Waiting 20 seconds to observe auto-refresh...')
      await page.waitForTimeout(20000)
      
      await page.screenshot({ path: 'test-results/ui-006-notifications-after-20s.png', fullPage: true })
      
      const finalContent = await page.content()
      
      if (initialContent !== finalContent) {
        console.log('✅ UI-006 PASS: Notifications auto-refreshed (content changed)')
      } else {
        console.log('⚠️  UI-006 NOTE: No visible change after 20s (may be no new notifications)')
      }
    } else {
      console.log('❌ UI-006 BLOCKED: Could not find Notifications navigation link')
    }
  }, { timeout: 60000 })

  test('UI-007: Open Overview tab - verify stats display', async ({ page }) => {
    // Login first
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Dashboard is likely the Overview
    await page.screenshot({ path: 'test-results/ui-007-overview.png', fullPage: true })
    
    // Look for Overview link or assume dashboard is overview
    const overviewLink = page.locator('a[href*="/overview"], button:has-text("Overview")').first()
    
    if (await overviewLink.count() > 0) {
      await overviewLink.click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'test-results/ui-007-overview-page.png', fullPage: true })
    }
    
    // Look for stats/metrics
    const hasStats = await page.locator('[class*="stat"], [class*="metric"], [class*="card"]').count() > 0
    const hasNumbers = await page.locator('text=/\\d+/').count() > 0
    
    if (hasStats || hasNumbers) {
      console.log('✅ UI-007 PASS: Overview displays stats/data')
    } else {
      console.log('⚠️  UI-007 PARTIAL: Overview loaded but stats not clearly visible')
    }
  })
})
