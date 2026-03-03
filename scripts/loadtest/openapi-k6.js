import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
  vus: 20,
  duration: '60s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
}

const baseUrl = __ENV.BASE_URL || 'http://localhost:8000'
const clientId = __ENV.CLIENT_ID || 'openapi-default-client'
const clientSecret = __ENV.CLIENT_SECRET || 'openapi-default-secret'

function getToken() {
  const payload = `grant_type=client_credentials&client_id=${clientId}&client_secret=${clientSecret}&scope=transactions:read`
  const res = http.post(`${baseUrl}/v1/oauth/token`, payload, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  check(res, {
    'token status is 200': (r) => r.status === 200,
    'token success true': (r) => r.json('success') === true,
  })
  return res.json('data.access_token')
}

export default function () {
  const token = getToken()
  const res = http.get(`${baseUrl}/v1/transactions`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  check(res, {
    'transactions status is 200': (r) => r.status === 200,
    'transactions success true': (r) => r.json('success') === true,
  })
  sleep(1)
}
