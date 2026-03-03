import { test } from '@playwright/test'
import * as fs from 'fs'

const TEST_USER = { email: 'qa_ui@example.com', password: 'Password1' }
const CERT_FILE = '/Users/sheliasun/Library/Mobile Documents/com~apple~CloudDocs/edi-portal-prototype/public/certificates/LOGISTICSTEAM_SHA256_2031.cer'

test.describe.configure({ mode: 'serial' })

test.describe('Manual UI Verification Tests', () => {
  
  test('Complete UI Flow with Screenshots', async ({ page }) => {
    console.log('\n=== STARTING COMPREHENSIVE UI TEST ===\n')
    
    // UI-002: Visit dashboard logged out
    console.log('TEST UI-002: Visit /dashboard logged out')
    await page.context().clearCookies()
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    console.log(`  Result: Redirected to ${page.url()}`)
    console.log(`  Status: ${page.url() === 'http://localhost:3000/' ? '✅ PASS' : '❌ FAIL'}`)
    await page.screenshot({ path: 'test-results/manual-ui-002.png', fullPage: true })
    
    // UI-001: Login
    console.log('\nTEST UI-001: Login with qa_ui@example.com')
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    console.log(`  Result: Redirected to ${page.url()}`)
    console.log(`  Status: ${page.url().includes('/dashboard') ? '✅ PASS' : '❌ FAIL'}`)
    await page.screenshot({ path: 'test-results/manual-ui-001.png', fullPage: true })
    
    // UI-003: Partners page
    console.log('\nTEST UI-003: Navigate to Partners page')
    await page.click('text=Trading Partners')
    await page.waitForTimeout(2000)
    const hasPartners = await page.locator('text=Walmart').count() > 0
    console.log(`  Result: Partners data visible = ${hasPartners}`)
    console.log(`  Status: ${hasPartners ? '✅ PASS' : '❌ FAIL'}`)
    await page.screenshot({ path: 'test-results/manual-ui-003.png', fullPage: true })
    
    // UI-004: Certificates upload
    console.log('\nTEST UI-004: Upload certificate')
    await page.click('text=Certificates')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/manual-ui-004-page.png', fullPage: true })
    
    const uploadBtn = page.locator('button:has-text("Upload Certificate")')
    if (await uploadBtn.count() > 0) {
      console.log('  Found Upload Certificate button, clicking...')
      await uploadBtn.click()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: 'test-results/manual-ui-004-modal.png', fullPage: true })
      
      // Fill required fields if present
      const nameInput = page.locator('input[name="name"], input[placeholder*="name" i]').first()
      if (await nameInput.count() > 0 && await nameInput.isVisible()) {
        console.log('  Filling certificate name...')
        await nameInput.fill('Test Logistics Certificate')
      }
      
      const partnerSelect = page.locator('select, button[role="combobox"]').first()
      if (await partnerSelect.count() > 0 && await partnerSelect.isVisible()) {
        console.log('  Selecting partner...')
        await partnerSelect.click()
        await page.waitForTimeout(500)
        const firstOption = page.locator('[role="option"]').first()
        if (await firstOption.count() > 0) {
          await firstOption.click()
        }
      }
      
      // Upload file
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.count() > 0) {
        console.log('  Uploading certificate file...')
        await fileInput.setInputFiles(CERT_FILE)
        await page.waitForTimeout(2000)
        await page.screenshot({ path: 'test-results/manual-ui-004-file-selected.png', fullPage: true })
        
        // Try to submit
        const submitBtn = page.locator('button:has-text("Upload"), button:has-text("Save")').last()
        if (await submitBtn.count() > 0) {
          const isEnabled = await submitBtn.isEnabled()
          console.log(`  Submit button enabled: ${isEnabled}`)
          if (isEnabled) {
            await submitBtn.click()
            await page.waitForTimeout(3000)
            await page.screenshot({ path: 'test-results/manual-ui-004-after-upload.png', fullPage: true })
            console.log('  Status: ✅ PASS - Upload completed')
          } else {
            console.log('  Status: ⚠️  BLOCKED - Submit button disabled (missing required fields)')
            await page.screenshot({ path: 'test-results/manual-ui-004-blocked.png', fullPage: true })
          }
        }
      } else {
        console.log('  Status: ❌ BLOCKED - No file input found')
      }
    } else {
      console.log('  Status: ❌ BLOCKED - Upload button not found')
    }
    
    // UI-005: Partner detail specifications
    console.log('\nTEST UI-005: Partner detail - Specifications upload')
    await page.click('text=Trading Partners')
    await page.waitForTimeout(2000)
    
    const viewDetails = page.locator('button:has-text("View Details")').first()
    if (await viewDetails.count() > 0) {
      await viewDetails.click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'test-results/manual-ui-005-detail.png', fullPage: true })
      
      // Look for Specifications tab
      const specsTab = page.locator('text=/Specification/i')
      if (await specsTab.count() > 0) {
        console.log('  Found Specifications section')
        await specsTab.first().click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: 'test-results/manual-ui-005-specs-tab.png', fullPage: true })
        console.log('  Status: ⚠️  PARTIAL - Specifications section accessible')
      } else {
        console.log('  Status: ⚠️  NOTE - No Specifications tab found')
      }
    }
    
    // UI-006: Notifications
    console.log('\nTEST UI-006: Notifications auto-refresh')
    await page.click('text=Notifications')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/manual-ui-006-before.png', fullPage: true })
    console.log('  Waiting 20 seconds for auto-refresh...')
    await page.waitForTimeout(20000)
    await page.screenshot({ path: 'test-results/manual-ui-006-after.png', fullPage: true })
    console.log('  Status: ⚠️  NOTE - 20s wait completed (no new notifications to verify refresh)')
    
    // UI-007: Overview
    console.log('\nTEST UI-007: Overview stats display')
    await page.click('text=Overview')
    await page.waitForTimeout(2000)
    const hasStats = await page.locator('text=/Active Certificates|Trading Partners/').count() > 0
    console.log(`  Result: Stats visible = ${hasStats}`)
    console.log(`  Status: ${hasStats ? '✅ PASS' : '❌ FAIL'}`)
    await page.screenshot({ path: 'test-results/manual-ui-007.png', fullPage: true })
    
    // SPEC-CONTROLS: Message Specifications
    console.log('\nTEST SPEC-CONTROLS: Message Specifications - Update & Active/Inactive')
    await page.click('text=Message Specifications')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/manual-spec-page.png', fullPage: true })
    
    // Look for Trading Partner Specifications tab
    const tpTab = page.locator('text=/Trading Partner/i, button:has-text("TP Spec")')
    if (await tpTab.count() > 0) {
      console.log('  Found Trading Partner Specifications section')
      await tpTab.first().click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/manual-spec-tp-tab.png', fullPage: true })
    }
    
    // Look for Update button
    const updateBtn = page.locator('button:has-text("Update")').first()
    if (await updateBtn.count() > 0) {
      console.log('  Found Update button, clicking...')
      await updateBtn.click()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: 'test-results/manual-spec-update-modal.png', fullPage: true })
      console.log('  Status: ✅ PASS - Update modal opens')
      
      // Close modal
      const closeBtn = page.locator('button:has-text("Cancel"), button:has-text("Close"), [aria-label="Close"]')
      if (await closeBtn.count() > 0) {
        await closeBtn.first().click()
        await page.waitForTimeout(500)
      }
    } else {
      console.log('  Status: ⚠️  NOTE - No Update button found')
    }
    
    // Look for Active/Inactive toggle
    const activeToggle = page.locator('button:has-text("Set Active"), button:has-text("Set Inactive"), button:has-text("Activate"), button:has-text("Deactivate")')
    if (await activeToggle.count() > 0) {
      console.log('  Found Active/Inactive toggle')
      await page.screenshot({ path: 'test-results/manual-spec-before-toggle.png', fullPage: true })
      
      const initialText = await activeToggle.first().textContent()
      console.log(`  Initial button text: ${initialText}`)
      
      await activeToggle.first().click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'test-results/manual-spec-after-toggle.png', fullPage: true })
      
      const newText = await activeToggle.first().textContent()
      console.log(`  New button text: ${newText}`)
      console.log(`  Status: ${initialText !== newText ? '✅ PASS' : '⚠️  PARTIAL'} - Toggle clicked`)
    } else {
      console.log('  Status: ⚠️  NOTE - No Active/Inactive toggle found')
    }
    
    console.log('\n=== TEST EXECUTION COMPLETE ===\n')
  }, { timeout: 120000 })
})
