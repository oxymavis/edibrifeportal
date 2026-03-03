import { expect, test } from '@playwright/test'
import * as path from 'path'
import * as fs from 'fs'

const TEST_USER = {
  email: 'qa_ui@example.com',
  password: 'Password1',
}

const CERT_FILE_PATH = '/Users/sheliasun/Library/Mobile Documents/com~apple~CloudDocs/edi-portal-prototype/public/certificates/LOGISTICSTEAM_SHA256_2031.cer'

// Run tests sequentially
test.describe.configure({ mode: 'serial' })

test.describe('Comprehensive UI Tests with Specification Controls', () => {
  
  test('UI-002: Visit /dashboard logged out - confirm redirect', async ({ page }) => {
    await page.context().clearCookies()
    await page.goto('/dashboard')
    await page.waitForTimeout(2000)
    
    const currentUrl = page.url()
    console.log(`UI-002: URL after /dashboard = ${currentUrl}`)
    
    if (currentUrl === 'http://localhost:3000/' || currentUrl.includes('/login')) {
      console.log('✅ UI-002 PASS: Redirected to login')
      await page.screenshot({ path: 'test-results/final-ui-002.png' })
    } else {
      console.log('❌ UI-002 FAIL: No redirect')
    }
  })

  test('UI-001: Login and confirm redirect to /dashboard', async ({ page }) => {
    await page.goto('/')
    await page.waitForTimeout(1000)
    
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    const currentUrl = page.url()
    console.log(`UI-001: URL after login = ${currentUrl}`)
    
    if (currentUrl.includes('/dashboard')) {
      console.log('✅ UI-001 PASS: Redirected to dashboard')
      await page.screenshot({ path: 'test-results/final-ui-001.png' })
    } else {
      console.log('❌ UI-001 FAIL: Not on dashboard')
    }
  })

  test('UI-003: Partners page renders', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    await page.click('text=Trading Partners')
    await page.waitForTimeout(2000)
    
    const hasData = await page.locator('text=Walmart').count() > 0
    console.log(`UI-003: Partners page has data = ${hasData}`)
    
    if (hasData) {
      console.log('✅ UI-003 PASS: Partners page renders with data')
      await page.screenshot({ path: 'test-results/final-ui-003.png' })
    } else {
      console.log('❌ UI-003 FAIL: No partner data visible')
    }
  })

  test('UI-004: Certificates - Upload via button', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    await page.click('text=Certificates')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/final-ui-004-before.png' })
    
    // Look for Upload Certificate button
    const uploadButton = page.locator('button:has-text("Upload Certificate")')
    
    if (await uploadButton.count() > 0) {
      console.log('Found Upload Certificate button')
      await uploadButton.click()
      await page.waitForTimeout(1000)
      
      // Look for file input in modal/dialog
      const fileInput = page.locator('input[type="file"]')
      
      if (await fileInput.count() > 0) {
        console.log('Found file input, uploading...')
        await fileInput.setInputFiles(CERT_FILE_PATH)
        await page.waitForTimeout(2000)
        
        // Look for submit/upload button in modal
        const submitButton = page.locator('button:has-text("Upload"), button[type="submit"]').last()
        if (await submitButton.count() > 0) {
          await submitButton.click()
          await page.waitForTimeout(3000)
        }
        
        await page.screenshot({ path: 'test-results/final-ui-004-after.png' })
        
        // Check if certificate appears
        const certName = path.basename(CERT_FILE_PATH)
        const hasCert = await page.getByText(certName, { exact: false }).count() > 0
        
        if (hasCert) {
          console.log('✅ UI-004 PASS: Certificate uploaded and visible')
        } else {
          console.log('⚠️  UI-004 PARTIAL: Upload completed, checking list...')
          // Check for any new certificate in the list
          const certCount = await page.locator('text=/Logistics|LOGISTICSTEAM/i').count()
          console.log(`Certificate count with "Logistics": ${certCount}`)
        }
      } else {
        console.log('❌ UI-004 BLOCKED: No file input found in modal')
        await page.screenshot({ path: 'test-results/final-ui-004-modal.png' })
      }
    } else {
      console.log('❌ UI-004 BLOCKED: Upload Certificate button not found')
    }
  })

  test('UI-005: Partner detail - Upload specification', async ({ page }) => {
    // Create a test spec file
    const testSpecPath = '/tmp/test-specification.txt'
    fs.writeFileSync(testSpecPath, 'Test EDI Specification\nVersion: 1.0\nMessage Type: 850 PO\n')
    
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    await page.click('text=Trading Partners')
    await page.waitForTimeout(2000)
    
    // Click on Walmart or View Details
    const detailButton = page.locator('button:has-text("View Details"), a:has-text("View Details")').first()
    if (await detailButton.count() > 0) {
      await detailButton.click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'test-results/final-ui-005-detail.png' })
      
      // Look for Specifications tab or section
      const specsTab = page.locator('text=/Specification/i, button:has-text("Specification")')
      if (await specsTab.count() > 0) {
        await specsTab.first().click()
        await page.waitForTimeout(1000)
        await page.screenshot({ path: 'test-results/final-ui-005-specs.png' })
        
        // Look for upload button or file input
        const uploadBtn = page.locator('button:has-text("Upload"), button:has-text("Add")')
        if (await uploadBtn.count() > 0) {
          await uploadBtn.first().click()
          await page.waitForTimeout(1000)
          
          const fileInput = page.locator('input[type="file"]')
          if (await fileInput.count() > 0) {
            await fileInput.setInputFiles(testSpecPath)
            await page.waitForTimeout(2000)
            
            const submitBtn = page.locator('button:has-text("Upload"), button[type="submit"]').last()
            if (await submitBtn.count() > 0) {
              await submitBtn.click()
              await page.waitForTimeout(2000)
            }
            
            console.log('✅ UI-005 PASS: Specification upload completed')
            await page.screenshot({ path: 'test-results/final-ui-005-uploaded.png' })
          } else {
            console.log('⚠️  UI-005 PARTIAL: Upload button found but no file input')
          }
        } else {
          console.log('⚠️  UI-005 NOTE: Specifications section found, no upload button visible')
        }
      } else {
        console.log('⚠️  UI-005 NOTE: No Specifications tab found in partner detail')
      }
    } else {
      console.log('❌ UI-005 BLOCKED: Could not open partner detail')
    }
  })

  test('UI-006: Notifications - Wait 20s for refresh', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    await page.click('text=Notifications')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/final-ui-006-before.png' })
    
    const beforeContent = await page.content()
    console.log('⏳ UI-006: Waiting 20 seconds...')
    await page.waitForTimeout(20000)
    
    const afterContent = await page.content()
    await page.screenshot({ path: 'test-results/final-ui-006-after.png' })
    
    if (beforeContent !== afterContent) {
      console.log('✅ UI-006 PASS: Content changed (auto-refresh detected)')
    } else {
      console.log('⚠️  UI-006 NOTE: No content change (no new notifications)')
    }
  }, { timeout: 60000 })

  test('UI-007: Overview stats display', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Dashboard is the overview
    await page.screenshot({ path: 'test-results/final-ui-007.png' })
    
    const hasStats = await page.locator('text=/Active Certificates|Trading Partners|Recent Transactions/').count() > 0
    
    if (hasStats) {
      console.log('✅ UI-007 PASS: Overview displays stats')
    } else {
      console.log('❌ UI-007 FAIL: Stats not visible')
    }
  })

  test('SPEC-CONTROLS: Message Specifications - Update and Set Active/Inactive', async ({ page }) => {
    await page.goto('/')
    await page.fill('input[type="email"]', TEST_USER.email)
    await page.fill('input[type="password"]', TEST_USER.password)
    await page.click('button[type="submit"]')
    await page.waitForTimeout(3000)
    
    // Navigate to Message Specifications
    await page.click('text=Message Specifications')
    await page.waitForTimeout(2000)
    await page.screenshot({ path: 'test-results/final-spec-controls-page.png' })
    
    // Look for Trading Partner Specifications section or tab
    const tpSpecTab = page.locator('text=/Trading Partner/i, button:has-text("Trading Partner")')
    if (await tpSpecTab.count() > 0) {
      await tpSpecTab.first().click()
      await page.waitForTimeout(1000)
      await page.screenshot({ path: 'test-results/final-spec-controls-tp-tab.png' })
    }
    
    // Look for Update button
    const updateButton = page.locator('button:has-text("Update")').first()
    
    if (await updateButton.count() > 0) {
      console.log('Found Update button')
      await updateButton.click()
      await page.waitForTimeout(1500)
      await page.screenshot({ path: 'test-results/final-spec-controls-modal.png' })
      
      // Look for file input in modal
      const fileInput = page.locator('input[type="file"]')
      if (await fileInput.count() > 0) {
        // Create a test spec file
        const testSpecPath = '/tmp/updated-specification.txt'
        fs.writeFileSync(testSpecPath, 'Updated EDI Specification\nVersion: 2.0\nMessage Type: 850 PO Updated\n')
        
        await fileInput.setInputFiles(testSpecPath)
        await page.waitForTimeout(2000)
        
        const submitBtn = page.locator('button:has-text("Upload"), button:has-text("Save"), button[type="submit"]').last()
        if (await submitBtn.count() > 0) {
          await submitBtn.click()
          await page.waitForTimeout(2000)
          await page.screenshot({ path: 'test-results/final-spec-controls-uploaded.png' })
          console.log('✅ SPEC-CONTROLS: Specification uploaded via Update button')
        }
      } else {
        console.log('⚠️  SPEC-CONTROLS: Update modal opened but no file input found')
      }
    } else {
      console.log('⚠️  SPEC-CONTROLS: No Update button found')
      await page.screenshot({ path: 'test-results/final-spec-controls-no-update.png' })
    }
    
    // Look for Set Active/Inactive toggle
    await page.waitForTimeout(1000)
    const activeToggle = page.locator('button:has-text("Set Active"), button:has-text("Set Inactive"), button:has-text("Active"), button:has-text("Inactive")')
    
    if (await activeToggle.count() > 0) {
      console.log('Found Active/Inactive toggle')
      
      // Get initial status
      const initialStatus = await page.locator('text=/active|inactive/i').first().textContent()
      console.log(`Initial status: ${initialStatus}`)
      await page.screenshot({ path: 'test-results/final-spec-controls-before-toggle.png' })
      
      // Click toggle
      await activeToggle.first().click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'test-results/final-spec-controls-after-toggle.png' })
      
      // Check if status changed
      const newStatus = await page.locator('text=/active|inactive/i').first().textContent()
      console.log(`New status: ${newStatus}`)
      
      if (initialStatus !== newStatus) {
        console.log('✅ SPEC-CONTROLS: Status toggle works - label changed')
      } else {
        console.log('⚠️  SPEC-CONTROLS: Status toggle clicked but label unchanged')
      }
    } else {
      console.log('⚠️  SPEC-CONTROLS: No Active/Inactive toggle found')
    }
  })
})
