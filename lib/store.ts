/**
 * In-memory store for EDI Portal API (prototype).
 * Replace with database (e.g. PostgreSQL) in production.
 */

// ---------- Types (aligned with Functional Specification §9) ----------

export interface PrimaryContact {
  name: string
  email: string
  phone?: string
}

export interface AS2Profile {
  id: string
  name: string
  as2Id: string
  as2Url: string
  status: "active" | "standby" | "inactive"
  encryptionCert?: string
  signingCert?: string
  mdnRequired: boolean
  mdnSigned: boolean
  encryptionAlgorithm: string
  signatureAlgorithm: string
}

export interface MessageTypeConfig {
  messageType: string
  messageName: string
  direction: "inbound" | "outbound"
  enabled: boolean
}

export interface RoutingRule {
  id: string
  messageType: string
  messageName: string
  routingType: "return_to_sender" | "specific_partner"
  targetPartner?: string
  targetSubsidiary?: string
  enabled: boolean
  description?: string
}

export interface Subsidiary {
  id: string
  name: string
  code: string
  region: string
  status: "active" | "inactive"
  as2Profiles: AS2Profile[]
  supportedDocTypes: { x12: string[]; edifact: string[] }
  messageRouting?: { enabledTypes: MessageTypeConfig[]; rules: RoutingRule[] }
}

export interface TradingPartner {
  id: string
  name: string
  code: string
  status: "active" | "inactive"
  industry: string
  website?: string
  primaryContact: PrimaryContact
  subsidiaries: Subsidiary[]
  environment?: "production" | "sandbox"
}

export interface Certificate {
  id: number
  name: string
  serialNumber: string
  fingerprint: string
  issuer: string
  subject: string
  algorithm: string
  keySize: string
  created: string
  expires: string
  usage: string
  type: string
  status: "active" | "expiring" | "expired"
  partner: string
  environment: "production" | "sandbox"
}

export interface LogEntry {
  timestamp: string
  level: "info" | "success" | "error" | "warning"
  message: string
}

export interface ErrorEntry {
  code: string
  severity: "error" | "warning"
  segment: string
  position: string
  message: string
  suggestion: string
}

export interface Transaction {
  id: string
  type: string
  typeName: string
  partner: string
  direction: "inbound" | "outbound"
  status: "completed" | "processing" | "error" | "pending"
  date: string
  time: string
  size: string
  records: number
  controlNumber: string
  senderId: string
  receiverId: string
  raw: string
  logs: LogEntry[]
  errors?: ErrorEntry[]
  environment: "production" | "sandbox"
}

export interface Notification {
  id: number
  type: "warning" | "error" | "info"
  title: string
  message: string
  date: string
  time: string
  read: boolean
  archived: boolean
  environment: "production" | "sandbox"
  action?: { label: string; href: string }
  details?: Record<string, string>
}

export interface UNISSpecification {
  code: string
  name: string
  description: string
  category: string
  version: string
  lastUpdated: string
}

export interface TPSpecification {
  id: string
  messageType: string
  messageName: string
  partner: string
  partnerCode: string
  version: string
  uploadedDate: string
  uploadedBy: string
  fileType: "PDF" | "Excel" | "X12" | "JSON"
  fileName: string
  size: string
}

// ---------- Seed data ----------

function seedPartners(): TradingPartner[] {
  return [
    {
      id: "tp-001",
      name: "Walmart",
      code: "WMT",
      status: "active",
      industry: "retail",
      website: "https://walmart.com",
      primaryContact: { name: "EDI Team", email: "edi@walmart.com", phone: "+1-800-925-6278" },
      subsidiaries: [
        {
          id: "sub-wmt-us",
          name: "Walmart US",
          code: "WMT-US",
          region: "United States",
          status: "active",
          as2Profiles: [
            {
              id: "as2-wmt-1",
              name: "Walmart US Primary",
              as2Id: "WALMART-US-PROD",
              as2Url: "https://as2.wal-mart.com/us",
              status: "active",
              encryptionCert: "wmt-us-enc.cer",
              signingCert: "wmt-us-sign.cer",
              mdnRequired: true,
              mdnSigned: true,
              encryptionAlgorithm: "AES-256",
              signatureAlgorithm: "SHA-256",
            },
          ],
          supportedDocTypes: { x12: ["850", "855", "856", "810", "940", "945", "997"], edifact: [] },
        },
      ],
    },
    {
      id: "tp-002",
      name: "Target Corporation",
      code: "TGT",
      status: "active",
      industry: "retail",
      primaryContact: { name: "EDI Support", email: "edi@target.com" },
      subsidiaries: [
        {
          id: "sub-tgt-1",
          name: "Target Stores",
          code: "TGT-STR",
          region: "United States",
          status: "active",
          as2Profiles: [
            {
              id: "as2-tgt-1",
              name: "Target AS2",
              as2Id: "TARGET-STORES-PROD",
              as2Url: "https://as2.target.com/stores",
              status: "active",
              mdnRequired: true,
              mdnSigned: true,
              encryptionAlgorithm: "AES-256",
              signatureAlgorithm: "SHA-256",
            },
          ],
          supportedDocTypes: { x12: ["850", "855", "856", "810", "846", "997"], edifact: [] },
        },
      ],
    },
    {
      id: "tp-003",
      name: "SPS Commerce",
      code: "SPS",
      status: "active",
      industry: "van",
      primaryContact: { name: "Support", email: "support@spscommerce.com" },
      subsidiaries: [
        {
          id: "sub-sps-1",
          name: "SPS Commerce - Retail",
          code: "SPS-RTL",
          region: "North America",
          status: "active",
          as2Profiles: [
            {
              id: "as2-sps-1",
              name: "SPS Retail Primary",
              as2Id: "SPS-RETAIL-PROD",
              as2Url: "https://as2.spscommerce.com/retail",
              status: "active",
              mdnRequired: true,
              mdnSigned: true,
              encryptionAlgorithm: "AES-256",
              signatureAlgorithm: "SHA-256",
            },
          ],
          supportedDocTypes: { x12: ["850", "855", "856", "810", "940", "997"], edifact: [] },
        },
      ],
    },
  ]
}

function seedCertificates(): Certificate[] {
  const now = new Date()
  const future = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  return [
    {
      id: 1,
      name: "Walmart US - Encryption",
      partner: "Walmart",
      serialNumber: "7A:8B:C1:D2:E3:F4:05:16:27:38:49:5A:6B:7C:8D:9E",
      fingerprint: "3F:E2:4A:78:9B:C1:D5:E8:4F:2A:6B:9C:D3:E1:F5:A2",
      issuer: "DigiCert Inc",
      subject: "CN=walmart-us.edi.example.com",
      algorithm: "SHA256RSA",
      keySize: "2048",
      created: "2023-12-15",
      expires: future(365),
      usage: "Encryption",
      type: "X.509",
      status: "active",
      environment: "production",
    },
    {
      id: 2,
      name: "Target Stores - AS2",
      partner: "Target",
      serialNumber: "1F:2E:3D:4C:5B:6A:79:88:97:A6:B5:C4:D3:E2:F1:00",
      fingerprint: "7C:E1:9F:A2:B8:D4:C6:3E:9A:F1:7B:2C:E8:D5:4A:1F",
      issuer: "Sectigo",
      subject: "CN=target-as2.edi.example.com",
      algorithm: "SHA256RSA",
      keySize: "2048",
      created: "2022-03-20",
      expires: future(30),
      usage: "AS2 Communication",
      type: "X.509",
      status: "expiring",
      environment: "production",
    },
    {
      id: 3,
      name: "Test Certificate A",
      partner: "Test Partner A",
      serialNumber: "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99",
      fingerprint: "TEST:FP:01:02:03:04:05:06:07:08:09:0A:0B:0C:0D:0E",
      issuer: "Test CA",
      subject: "CN=test-a.sandbox.example.com",
      algorithm: "SHA256RSA",
      keySize: "2048",
      created: "2024-01-01",
      expires: future(400),
      usage: "Encryption",
      type: "X.509",
      status: "active",
      environment: "sandbox",
    },
    {
      id: 4,
      name: "LOGISTICSTEAM SHA256 2031",
      partner: "Logistics Team",
      serialNumber: "20:31:00:00:00",
      fingerprint: "SHA256",
      issuer: "Logistics Team CA",
      subject: "CN=LOGISTICSTEAM_SHA256_2031",
      algorithm: "SHA256RSA",
      keySize: "2048",
      created: "2024-01-01",
      expires: future(365),
      usage: "Signing",
      type: "X.509",
      status: "active",
      environment: "production",
    },
  ]
}

function seedTransactions(): Transaction[] {
  const base = [
    {
      id: "TRX-850-001",
      type: "850",
      typeName: "Purchase Order",
      partner: "Walmart",
      direction: "inbound" as const,
      status: "completed" as const,
      date: "2024-01-20",
      time: "08:15:30",
      size: "6.2 KB",
      records: 298,
      controlNumber: "000001007",
      senderId: "3456789012345",
      receiverId: "1234567890123",
      raw: "ISA*00*          *00*          *01*3456789012345  *01*1234567890123  *240120*0815*U*00401*000001007*0*P*>~\nGS*PO*3456789012*1234567890*20240120*081530*7*X*004010~\nST*850*0001~\n...",
      logs: [
        { timestamp: "2024-01-20T08:15:30Z", level: "info", message: "Purchase order received" },
        { timestamp: "2024-01-20T08:15:31Z", level: "success", message: "Order accepted" },
      ],
      errors: [],
    },
    {
      id: "TRX-856-001",
      type: "856",
      typeName: "Advance Ship Notice",
      partner: "Target",
      direction: "outbound" as const,
      status: "completed" as const,
      date: "2024-01-19",
      time: "14:22:00",
      size: "7.4 KB",
      records: 342,
      controlNumber: "000001009",
      senderId: "1234567890123",
      receiverId: "6789012345678",
      raw: "ISA*00*          *00*          *01*1234567890123  *01*6789012345678  *240119*1422*U*00401*000001009*0*P*>~\n...",
      logs: [
        { timestamp: "2024-01-19T14:22:00Z", level: "info", message: "ASN generated" },
        { timestamp: "2024-01-19T14:22:01Z", level: "success", message: "ASN transmitted" },
      ],
      errors: [],
    },
    {
      id: "TRX-944-001",
      type: "944",
      typeName: "Warehouse Stock Receipt",
      partner: "Target",
      direction: "inbound" as const,
      status: "error" as const,
      date: "2024-01-18",
      time: "09:22:10",
      size: "3.1 KB",
      records: 234,
      controlNumber: "000001012",
      senderId: "5678901234567",
      receiverId: "1234567890123",
      raw: "ISA*00*...~",
      logs: [
        { timestamp: "2024-01-18T09:22:10Z", level: "info", message: "Receipt advice received" },
        { timestamp: "2024-01-18T09:22:11Z", level: "error", message: "Validation failed" },
      ],
      errors: [
        {
          code: "VAL-001",
          severity: "error",
          segment: "W07",
          position: "14",
          message: "Quantity mismatch on item ITEM-002",
          suggestion: "Reconcile received quantity with transfer document and resubmit.",
        },
      ],
    },
  ]
  const withEnv = (env: "production" | "sandbox") =>
    base.map((t) => ({ ...t, environment: env }))
  return [...withEnv("production"), ...withEnv("sandbox").map((t, i) => ({ ...t, id: `${t.id}-SB-${i + 1}` }))]
}

function seedNotifications(): Notification[] {
  return [
    {
      id: 1,
      type: "warning",
      title: "Certificate Expiring Soon",
      message: "AS2 Certificate for Target Stores expires in 30 days",
      date: "2024-01-15",
      time: "14:30",
      read: false,
      archived: false,
      environment: "production",
      action: { label: "View Certificate", href: "/dashboard?tab=certificates" },
      details: { partnerName: "Target Corporation", certificateName: "Target Stores - AS2", expiresIn: "30 days" },
    },
    {
      id: 2,
      type: "error",
      title: "Transaction Processing Failed",
      message: "EDI-940 document processing failed due to validation error",
      date: "2024-01-14",
      time: "10:15",
      read: false,
      archived: false,
      environment: "production",
      action: { label: "View Transaction", href: "/dashboard?tab=transactions" },
      details: { partnerName: "SPS Commerce", errorCode: "VAL-002" },
    },
    {
      id: 3,
      type: "info",
      title: "New Trading Partner Added",
      message: "Walmart has been configured and is ready for transactions",
      date: "2024-01-11",
      time: "11:00",
      read: true,
      archived: false,
      environment: "production",
      details: { partnerName: "Walmart" },
    },
    {
      id: 101,
      type: "info",
      title: "Sandbox Environment Ready",
      message: "Test Partner A has been configured in the sandbox environment",
      date: "2024-01-15",
      time: "09:00",
      read: false,
      archived: false,
      environment: "sandbox",
      details: { partnerName: "Test Partner A" },
    },
  ]
}

// ---------- Store state ----------

let partners: TradingPartner[] = seedPartners()
let certificates: Certificate[] = seedCertificates()
let transactions: Transaction[] = seedTransactions()
let notifications: Notification[] = seedNotifications()
let nextCertId = Math.max(0, ...certificates.map((c) => c.id)) + 1
let nextNotifId = Math.max(0, ...notifications.map((n) => n.id)) + 1

// ---------- Partners ----------

export function getPartners(environment?: "production" | "sandbox"): TradingPartner[] {
  if (!environment) return partners
  return partners.filter((p) => p.environment === environment || !p.environment)
}

export function getPartnerById(id: string): TradingPartner | undefined {
  return partners.find((p) => p.id === id)
}

export function createPartner(data: Omit<TradingPartner, "id">): TradingPartner {
  const id = `tp-${Date.now()}`
  const partner: TradingPartner = { ...data, id }
  partners.push(partner)
  return partner
}

export function updatePartner(id: string, data: Partial<TradingPartner>): TradingPartner | undefined {
  const i = partners.findIndex((p) => p.id === id)
  if (i === -1) return undefined
  partners[i] = { ...partners[i], ...data }
  return partners[i]
}

export function deletePartner(id: string): boolean {
  const i = partners.findIndex((p) => p.id === id)
  if (i === -1) return false
  partners.splice(i, 1)
  return true
}

// ---------- Certificates ----------

export function getCertificates(filters: {
  environment?: "production" | "sandbox"
  status?: string
  partner?: string
  search?: string
  expiry?: "30" | "60" | "90"
}): Certificate[] {
  let list = certificates
  if (filters.environment) list = list.filter((c) => c.environment === filters.environment)
  if (filters.status && filters.status !== "all") list = list.filter((c) => c.status === filters.status)
  if (filters.partner && filters.partner !== "all") list = list.filter((c) => c.partner === filters.partner)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.partner.toLowerCase().includes(q) ||
        c.serialNumber.toLowerCase().includes(q) ||
        c.fingerprint.toLowerCase().includes(q)
    )
  }
  if (filters.expiry) {
    const days = parseInt(filters.expiry, 10)
    const limit = new Date()
    limit.setDate(limit.getDate() + days)
    list = list.filter((c) => {
      const exp = new Date(c.expires)
      return exp <= limit && exp >= new Date()
    })
  }
  return list
}

export function getCertificateById(id: number): Certificate | undefined {
  return certificates.find((c) => c.id === id)
}

export function createCertificate(data: Omit<Certificate, "id">): Certificate {
  const id = nextCertId++
  const cert: Certificate = { ...data, id }
  certificates.push(cert)
  return cert
}

export function updateCertificate(id: number, data: Partial<Certificate>): Certificate | undefined {
  const i = certificates.findIndex((c) => c.id === id)
  if (i === -1) return undefined
  certificates[i] = { ...certificates[i], ...data }
  return certificates[i]
}

export function deleteCertificate(id: number): boolean {
  const i = certificates.findIndex((c) => c.id === id)
  if (i === -1) return false
  certificates.splice(i, 1)
  return true
}

// ---------- Transactions ----------

export function getTransactions(filters: {
  environment?: "production" | "sandbox"
  type?: string
  status?: string
  direction?: string
  partner?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}): Transaction[] {
  let list = transactions
  if (filters.environment) list = list.filter((t) => t.environment === filters.environment)
  if (filters.type && filters.type !== "all") list = list.filter((t) => t.type === filters.type)
  if (filters.status && filters.status !== "all") list = list.filter((t) => t.status === filters.status)
  if (filters.direction && filters.direction !== "all") list = list.filter((t) => t.direction === filters.direction)
  if (filters.partner && filters.partner !== "all") list = list.filter((t) => t.partner === filters.partner)
  if (filters.dateFrom) list = list.filter((t) => t.date >= filters.dateFrom!)
  if (filters.dateTo) list = list.filter((t) => t.date <= filters.dateTo!)
  if (filters.search) {
    const q = filters.search.toLowerCase()
    list = list.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.partner.toLowerCase().includes(q) ||
        t.controlNumber.toLowerCase().includes(q) ||
        t.senderId.toLowerCase().includes(q) ||
        t.receiverId.toLowerCase().includes(q)
    )
  }
  return list.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
}

export function getTransactionById(id: string): Transaction | undefined {
  return transactions.find((t) => t.id === id)
}

export function createTransaction(data: Omit<Transaction, "id">): Transaction {
  const id = `TRX-${data.type}-${Date.now()}`
  const trx: Transaction = { ...data, id }
  transactions.push(trx)
  return trx
}

// ---------- Notifications ----------

export function getNotifications(filters: {
  environment?: "production" | "sandbox"
  type?: string
  showArchived?: boolean
}): Notification[] {
  let list = notifications
  if (filters.environment) list = list.filter((n) => n.environment === filters.environment)
  if (filters.type && filters.type !== "all") list = list.filter((n) => n.type === filters.type)
  if (filters.showArchived === false) list = list.filter((n) => !n.archived)
  return list.sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`))
}

export function getNotificationById(id: number): Notification | undefined {
  return notifications.find((n) => n.id === id)
}

export function updateNotification(id: number, data: Partial<Notification>): Notification | undefined {
  const i = notifications.findIndex((n) => n.id === id)
  if (i === -1) return undefined
  notifications[i] = { ...notifications[i], ...data }
  return notifications[i]
}

export function markAllNotificationsRead(environment?: "production" | "sandbox"): void {
  notifications = notifications.map((n) => {
    if (environment && n.environment !== environment) return n
    if (n.archived) return n
    return { ...n, read: true }
  })
}

// ---------- Specifications (read-only seed) ----------

const unisSpecifications: UNISSpecification[] = [
  { code: "850", name: "Purchase Order", description: "Request purchase of goods or services", category: "Order Management", version: "005010", lastUpdated: "2024-01-15" },
  { code: "855", name: "Purchase Order Acknowledgment", description: "Confirms receipt of PO", category: "Order Management", version: "005010", lastUpdated: "2024-01-15" },
  { code: "856", name: "Advance Ship Notice", description: "Shipment contents and carrier details", category: "Shipping", version: "005010", lastUpdated: "2024-02-05" },
  { code: "810", name: "Invoice", description: "Commercial invoice", category: "Financial", version: "005010", lastUpdated: "2024-01-30" },
  { code: "204", name: "Motor Carrier Load Tender", description: "Request to carrier to transport", category: "Shipping", version: "005010", lastUpdated: "2024-01-25" },
  { code: "210", name: "Freight Invoice", description: "Freight invoice from carrier", category: "Shipping", version: "005010", lastUpdated: "2024-01-25" },
  { code: "214", name: "Shipment Status", description: "Shipment location and delivery status", category: "Shipping", version: "005010", lastUpdated: "2024-01-25" },
  { code: "832", name: "Price/Sales Catalog", description: "Product catalog with pricing", category: "Inventory", version: "005010", lastUpdated: "2024-01-12" },
  { code: "846", name: "Inventory Inquiry/Advice", description: "Inventory levels or request", category: "Inventory", version: "005010", lastUpdated: "2024-01-18" },
  { code: "940", name: "Warehouse Shipping Order", description: "Instruction to warehouse to ship", category: "Warehouse", version: "005010", lastUpdated: "2024-02-01" },
  { code: "943", name: "Warehouse Stock Transfer Shipment", description: "Goods transferred between warehouses", category: "Warehouse", version: "005010", lastUpdated: "2024-02-01" },
  { code: "944", name: "Warehouse Stock Transfer Receipt", description: "Confirmation of goods received", category: "Warehouse", version: "005010", lastUpdated: "2024-02-01" },
  { code: "945", name: "Warehouse Shipping Advice", description: "Notification that goods have been shipped", category: "Warehouse", version: "005010", lastUpdated: "2024-02-01" },
  { code: "947", name: "Warehouse Inventory Adjustment", description: "Inventory adjustments", category: "Warehouse", version: "005010", lastUpdated: "2024-01-20" },
  { code: "997", name: "Functional Acknowledgment", description: "Confirms receipt and syntax of EDI", category: "Acknowledgment", version: "005010", lastUpdated: "2024-01-05" },
]

let tpSpecifications: TPSpecification[] = [
  { id: "tp-spec-1", messageType: "850", messageName: "Purchase Order", partner: "Walmart US", partnerCode: "WMT-US", version: "5010-WMT-2024", uploadedDate: "2024-01-20", uploadedBy: "admin@walmart.com", fileType: "PDF", fileName: "WMT_850_Implementation_Guide_2024.pdf", size: "2.4 MB" },
  { id: "tp-spec-2", messageType: "856", messageName: "ASN", partner: "Walmart US", partnerCode: "WMT-US", version: "5010-WMT-2024", uploadedDate: "2024-01-20", uploadedBy: "admin@walmart.com", fileType: "PDF", fileName: "WMT_856_Implementation_Guide_2024.pdf", size: "3.1 MB" },
  { id: "tp-spec-3", messageType: "850", messageName: "Purchase Order", partner: "Target", partnerCode: "TGT", version: "5010-TGT-2024", uploadedDate: "2024-02-01", uploadedBy: "edi@target.com", fileType: "PDF", fileName: "TGT_850_Spec_v2024.pdf", size: "2.1 MB" },
]

export function getUNISSpecifications(category?: string): UNISSpecification[] {
  if (!category || category === "all") return unisSpecifications
  return unisSpecifications.filter((s) => s.category.toLowerCase().replace(/\s/g, "") === category.toLowerCase().replace(/\s/g, ""))
}

export function getTPSpecifications(partner?: string, search?: string): TPSpecification[] {
  let list = tpSpecifications
  if (partner && partner !== "all") list = list.filter((s) => s.partner === partner || s.partnerCode === partner)
  if (search) {
    const q = search.toLowerCase()
    list = list.filter(
      (s) =>
        s.messageType.toLowerCase().includes(q) ||
        s.messageName.toLowerCase().includes(q) ||
        s.partner.toLowerCase().includes(q) ||
        s.fileName.toLowerCase().includes(q)
    )
  }
  return list
}

export function createTPSpecification(data: Omit<TPSpecification, "id">): TPSpecification {
  const id = `tp-spec-${Date.now()}`
  const spec: TPSpecification = { ...data, id }
  tpSpecifications.push(spec)
  return spec
}
