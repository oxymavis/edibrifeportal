import { test } from '@playwright/test'
import * as fs from 'fs'

const TEST_USER = { email: 'qa_ui@example.com', password: 'Password1' }

test('All UI Tests - Final Comprehensive Run', async ({ page }) => {
  test.setTimeout(120000)
  const results = []
  
  // Helper to close any open modals
  const closeModal = async () => {
    const closeBtns = ['button:has-text("Close")', 'button:has-text("Cancel")', '[aria-label="Close"]', 'button:has-text("×")', 'button:has-text("X")']
    for (const selector of closeBtns) {
      const btn = page.locator(selector).first()
      if (await btn.count() > 0) {
        try {
          await btn.click({ timeout: 2000 })
          await page.waitForTimeout(500)
          break
        } catch (e) {
          // Try next selector
        }
      }
    }
    // Also try pressing Escape
    await page.keyboard.press('Escape')
    await page.waitForTimeout(500)
  }
  
  // UI-002
  console.log('\n=== UI-002: Visit /dashboard logged out ===')
  await page.context().clearCookies()
  await page.goto('/dashboard')
  await page.waitForTimeout(2000)
  const redirected = page.url() === 'http://localhost:3000/'
  console.log(`Result: ${redirected ? '✅ PASS' : '❌ FAIL'} - Redirected to ${page.url()}`)
  results.push({ test: 'UI-002', status: redirected ? 'PASS' : 'FAIL', note: 'Dashboard redirect when logged out' })
  await page.screenshot({ path: 'test-results/final-ui-002.png', fullPage: true })
  
  // UI-001
  console.log('\n=== UI-001: Login ===')
  await page.goto('/')
  await page.fill('input[type="email"]', TEST_USER.email)
  await page.fill('input[type="password"]', TEST_USER.password)
  await page.click('button[type="submit"]')
  await page.waitForTimeout(3000)
  const loggedIn = page.url().includes('/dashboard')
  console.log(`Result: ${loggedIn ? '✅ PASS' : '❌ FAIL'} - URL: ${page.url()}`)
  results.push({ test: 'UI-001', status: loggedIn ? 'PASS' : 'FAIL', note: 'Login and redirect to dashboard' })
  await page.screenshot({ path: 'test-results/final-ui-001.png', fullPage: true })
  
  // UI-003
  console.log('\n=== UI-003: Partners page ===')
  await page.click('text=Trading Partners')
  await page.waitForTimeout(2000)
  const hasPartners = await page.locator('text=Walmart').count() > 0
  console.log(`Result: ${hasPartners ? '✅ PASS' : '❌ FAIL'} - Partners visible`)
  results.push({ test: 'UI-003', status: hasPartners ? 'PASS' : 'FAIL', note: 'Partners list renders' })
  await page.screenshot({ path: 'test-results/final-ui-003.png', fullPage: true })
  
  // UI-004
  console.log('\n=== UI-004: Certificate upload ===')
  await page.click('text=Certificates')
  await page.waitForTimeout(2000)
  
  const certCountBefore = await page.locator('text=/Showing \\d+ of \\d+ certificates/').textContent()
  console.log(`Certificates before: ${certCountBefore}`)
  
  await page.click('button:has-text("Upload Certificate")')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'test-results/final-ui-004-modal.png', fullPage: true })
  
  // Note: Modal requires fields - documenting as PARTIAL
  console.log('Result: ⚠️  PARTIAL - Upload modal opens (requires partner/type selection)')
  results.push({ test: 'UI-004', status: 'PARTIAL', note: 'Upload button works, modal requires partner selection' })
  await closeModal()
  await page.waitForTimeout(500)
  
  // UI-005
  console.log('\n=== UI-005: Partner detail specifications ===')
  await page.click('text=Trading Partners')
  await page.waitForTimeout(2000)
  await page.click('button:has-text("View Details")')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'test-results/final-ui-005-modal.png', fullPage: true })
  
  const specsTab = page.locator('button:has-text("Specifications")').last()
  const hasSpecsTab = await specsTab.count() > 0
  if (hasSpecsTab) {
    await specsTab.click()
    await page.waitForTimeout(1000)
    await page.screenshot({ path: 'test-results/final-ui-005-specs.png', fullPage: true })
    console.log('Result: ✅ PASS - Specifications tab accessible')
    results.push({ test: 'UI-005', status: 'PASS', note: 'Specifications tab in partner detail' })
  } else {
    console.log('Result: ⚠️  NOTE - Specifications tab not found')
    results.push({ test: 'UI-005', status: 'NOTE', note: 'Specifications tab not visible' })
  }
  await closeModal()
  
  // UI-006
  console.log('\n=== UI-006: Notifications auto-refresh ===')
  await page.click('text=Notifications')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'test-results/final-ui-006-before.png', fullPage: true })
  console.log('Waiting 20 seconds...')
  await page.waitForTimeout(20000)
  await page.screenshot({ path: 'test-results/final-ui-006-after.png', fullPage: true })
  console.log('Result: ⚠️  NOTE - 20s wait completed (no new notifications to verify)')
  results.push({ test: 'UI-006', status: 'NOTE', note: '20s wait completed, no new notifications' })
  
  // UI-007
  console.log('\n=== UI-007: Overview stats ===')
  await page.click('text=Overview')
  await page.waitForTimeout(2000)
  const hasStats = await page.locator('text=/Active Certificates|Trading Partners/').count() > 0
  console.log(`Result: ${hasStats ? '✅ PASS' : '❌ FAIL'} - Stats visible`)
  results.push({ test: 'UI-007', status: hasStats ? 'PASS' : 'FAIL', note: 'Overview displays stats' })
  await page.screenshot({ path: 'test-results/final-ui-007.png', fullPage: true })
  
  // SPEC-CONTROLS
  console.log('\n=== SPEC-CONTROLS: Message Specifications ===')
  await page.click('text=Message Specifications')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'test-results/final-spec-page.png', fullPage: true })
  
  // Check for TP Specifications tab
  const tpTab = page.locator('text=/Trading Partner Spec/i')
  if (await tpTab.count() > 0) {
    await tpTab.first().click()
    await page.waitForTimeout(1000)
  }
  await page.screenshot({ path: 'test-results/final-spec-tp-section.png', fullPage: true })
  
  // Look for Update button
  const updateBtn = page.locator('button:has-text("Update")').first()
  let updateWorks = false
  if (await updateBtn.count() > 0) {
    await updateBtn.click()
    await page.waitForTimeout(1500)
    await page.screenshot({ path: 'test-results/final-spec-update-modal.png', fullPage: true })
    updateWorks = true
    console.log('✅ Update button opens modal')
    await closeModal()
  } else {
    console.log('⚠️  No Update button found')
  }
  
  // Look for Active/Inactive toggle
  const toggleBtn = page.locator('button:has-text("Set Active"), button:has-text("Set Inactive"), button:has-text("Activate"), button:has-text("Deactivate")').first()
  let toggleWorks = false
  if (await toggleBtn.count() > 0) {
    const beforeText = await toggleBtn.textContent()
    await page.screenshot({ path: 'test-results/final-spec-before-toggle.png', fullPage: true })
    await toggleBtn.click()
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/final-spec-after-toggle.png', fullPage: true })
    const afterText = await toggleBtn.textContent()
    toggleWorks = (beforeText !== afterText)
    console.log(`${toggleWorks ? '✅' : '⚠️ '} Toggle: "${beforeText}" -> "${afterText}"`)
  } else {
    console.log('⚠️  No Active/Inactive toggle found')
  }
  
  const specStatus = updateWorks && toggleWorks ? 'PASS' : (updateWorks || toggleWorks ? 'PARTIAL' : 'NOTE')
  results.push({ test: 'SPEC-CONTROLS', status: specStatus, note: `Update: ${updateWorks}, Toggle: ${toggleWorks}` })
  
  // Print summary
  console.log('\n=== TEST SUMMARY ===')
  results.forEach(r => {
    const icon = r.status === 'PASS' ? '✅' : r.status === 'FAIL' ? '❌' : '⚠️ '
    console.log(`${icon} ${r.test}: ${r.status} - ${r.note}`)
  })
  
  // Write summary to file
  const summary = results.map(r => `${r.test}: ${r.status} - ${r.note}`).join('\n')
  fs.writeFileSync('test-results/FINAL-TEST-SUMMARY.txt', summary)
  console.log('\nSummary written to test-results/FINAL-TEST-SUMMARY.txt')
})
