import { expect, test } from '@playwright/test'

const apiBase = process.env.E2E_API_BASE_URL

test('856 shows related 850 in transaction detail', async ({ page, request }) => {
  test.skip(!apiBase, 'E2E_API_BASE_URL not provided')

  const unique = Date.now().toString()
  const partner = `E2E-Partner-${unique}`

  const e850 = await request.post(`${apiBase}/v1/integrations/events`, {
    headers: { 'x-api-key': 'dev-integration-key' },
    data: {
      idempotencyKey: `e2e-850-${unique}`,
      sourceSystem: 'edi',
      environment: 'production',
      partner,
      docType: '850',
      direction: 'outbound',
      status: 'completed',
      occurredAt: '2026-03-03T10:00:00Z',
      businessRefs: { poNo: `PO-${unique}` },
      controlRefs: { isaControlNo: `ISA-${unique}` },
      rawPayload: { message: '850' },
    },
  })
  expect(e850.ok()).toBeTruthy()
  const body850 = await e850.json()
  const trx850 = body850.data.transactionId

  const e856 = await request.post(`${apiBase}/v1/integrations/events`, {
    headers: { 'x-api-key': 'dev-integration-key' },
    data: {
      idempotencyKey: `e2e-856-${unique}`,
      sourceSystem: 'edi',
      environment: 'production',
      partner,
      docType: '856',
      direction: 'outbound',
      status: 'completed',
      occurredAt: '2026-03-03T10:10:00Z',
      businessRefs: { poNo: `PO-${unique}` },
      controlRefs: { isaControlNo: `ISA-${unique}-2` },
      rawPayload: { message: '856' },
    },
  })
  expect(e856.ok()).toBeTruthy()
  const body856 = await e856.json()
  const trx856 = body856.data.transactionId

  await page.goto('/')
  await page.getByText('Sign up').click()
  await page.getByPlaceholder('John Doe').fill('E2E User')
  await page.getByPlaceholder('you@company.com').fill(`e2e-${unique}@example.com`)
  await page.getByPlaceholder('Create a password').fill('Password1')
  await page.getByPlaceholder('Confirm your password').fill('Password1')
  await page.getByRole('button', { name: 'Sign up' }).click()

  await page.getByRole('button', { name: 'Transactions' }).click()
  await page.getByText(trx856).first().click()

  await expect(page.getByText('Related Documents')).toBeVisible()
  await expect(page.getByText(trx850)).toBeVisible()
})
