/**
 * Database API layer - same interface as store, implemented with Prisma.
 * Use this when DATABASE_URL is set; otherwise the app can fall back to in-memory store.
 */
import { prisma } from "@/lib/db"
import type {
  TradingPartner,
  Certificate,
  Transaction,
  Notification,
  UNISSpecification,
  TPSpecification,
  LogEntry,
  ErrorEntry,
} from "@/lib/store"

// ---------- Partners ----------

function mapPartnerToAPI(p: {
  id: string
  name: string
  code: string
  status: string
  industry: string
  website: string | null
  contactName: string
  contactEmail: string
  contactPhone: string | null
  environment: string | null
  subsidiaries: Array<{
    id: string
    name: string
    code: string
    region: string
    status: string
    supportedDocTypesX12: string[]
    supportedDocTypesEdifact: string[]
    as2Profiles: Array<{
      id: string
      name: string
      as2Id: string
      as2Url: string
      status: string
      encryptionCert: string | null
      signingCert: string | null
      mdnRequired: boolean
      mdnSigned: boolean
      encryptionAlgorithm: string
      signatureAlgorithm: string
    }>
  }>
}): TradingPartner {
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    status: p.status as "active" | "inactive",
    industry: p.industry,
    website: p.website ?? undefined,
    primaryContact: {
      name: p.contactName,
      email: p.contactEmail,
      phone: p.contactPhone ?? undefined,
    },
    subsidiaries: p.subsidiaries.map((s) => ({
      id: s.id,
      name: s.name,
      code: s.code,
      region: s.region,
      status: s.status as "active" | "inactive",
      as2Profiles: s.as2Profiles.map((a) => ({
        id: a.id,
        name: a.name,
        as2Id: a.as2Id,
        as2Url: a.as2Url,
        status: a.status as "active" | "standby" | "inactive",
        encryptionCert: a.encryptionCert ?? undefined,
        signingCert: a.signingCert ?? undefined,
        mdnRequired: a.mdnRequired,
        mdnSigned: a.mdnSigned,
        encryptionAlgorithm: a.encryptionAlgorithm,
        signatureAlgorithm: a.signatureAlgorithm,
      })),
      supportedDocTypes: {
        x12: s.supportedDocTypesX12 ?? [],
        edifact: s.supportedDocTypesEdifact ?? [],
      },
    })),
    environment: (p.environment as "production" | "sandbox") ?? undefined,
  }
}

export async function getPartners(environment?: "production" | "sandbox"): Promise<TradingPartner[]> {
  const where = environment ? { OR: [{ environment: environment }, { environment: null }] } : {}
  const list = await prisma.partner.findMany({
    where,
    include: {
      subsidiaries: {
        include: { as2Profiles: true },
      },
    },
  })
  return list.map(mapPartnerToAPI)
}

export async function getPartnerById(id: string): Promise<TradingPartner | undefined> {
  const p = await prisma.partner.findUnique({
    where: { id },
    include: {
      subsidiaries: { include: { as2Profiles: true } },
    },
  })
  return p ? mapPartnerToAPI(p) : undefined
}

export async function createPartner(data: Omit<TradingPartner, "id">): Promise<TradingPartner> {
  const partner = await prisma.partner.create({
    data: {
      name: data.name,
      code: data.code,
      status: data.status,
      industry: data.industry,
      website: data.website ?? null,
      contactName: data.primaryContact.name,
      contactEmail: data.primaryContact.email,
      contactPhone: data.primaryContact.phone ?? null,
      environment: data.environment ?? null,
      subsidiaries: {
        create: data.subsidiaries.map((s) => ({
          name: s.name,
          code: s.code,
          region: s.region,
          status: s.status,
          supportedDocTypesX12: s.supportedDocTypes?.x12 ?? [],
          supportedDocTypesEdifact: s.supportedDocTypes?.edifact ?? [],
          as2Profiles: {
            create: (s.as2Profiles ?? []).map((a) => ({
              name: a.name,
              as2Id: a.as2Id,
              as2Url: a.as2Url,
              status: a.status,
              encryptionCert: a.encryptionCert ?? null,
              signingCert: a.signingCert ?? null,
              mdnRequired: a.mdnRequired,
              mdnSigned: a.mdnSigned,
              encryptionAlgorithm: a.encryptionAlgorithm,
              signatureAlgorithm: a.signatureAlgorithm,
            })),
          },
        })),
      },
    },
    include: {
      subsidiaries: { include: { as2Profiles: true } },
    },
  })
  return mapPartnerToAPI(partner)
}

export async function updatePartner(
  id: string,
  data: Partial<TradingPartner>
): Promise<TradingPartner | undefined> {
  const existing = await prisma.partner.findUnique({ where: { id } })
  if (!existing) return undefined

  const updateData: Record<string, unknown> = {}
  if (data.name != null) updateData.name = data.name
  if (data.code != null) updateData.code = data.code
  if (data.status != null) updateData.status = data.status
  if (data.industry != null) updateData.industry = data.industry
  if (data.website != null) updateData.website = data.website
  if (data.primaryContact != null) {
    updateData.contactName = data.primaryContact.name
    updateData.contactEmail = data.primaryContact.email
    updateData.contactPhone = data.primaryContact.phone ?? null
  }
  if (data.environment != null) updateData.environment = data.environment

  const partner = await prisma.partner.update({
    where: { id },
    data: updateData,
    include: {
      subsidiaries: { include: { as2Profiles: true } },
    },
  })
  return mapPartnerToAPI(partner)
}

export async function deletePartner(id: string): Promise<boolean> {
  try {
    await prisma.partner.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

// ---------- Certificates ----------

function mapCertToAPI(c: {
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
  status: string
  partner: string
  environment: string
}): Certificate {
  return {
    id: c.id,
    name: c.name,
    serialNumber: c.serialNumber,
    fingerprint: c.fingerprint,
    issuer: c.issuer,
    subject: c.subject,
    algorithm: c.algorithm,
    keySize: c.keySize,
    created: c.created,
    expires: c.expires,
    usage: c.usage,
    type: c.type,
    status: c.status as "active" | "expiring" | "expired",
    partner: c.partner,
    environment: c.environment as "production" | "sandbox",
  }
}

export async function getCertificates(filters: {
  environment?: "production" | "sandbox"
  status?: string
  partner?: string
  search?: string
  expiry?: "30" | "60" | "90"
}): Promise<Certificate[]> {
  const where: Record<string, unknown> = {}
  if (filters.environment) where.environment = filters.environment
  if (filters.status && filters.status !== "all") where.status = filters.status
  if (filters.partner && filters.partner !== "all") where.partner = filters.partner
  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search, mode: "insensitive" } },
      { partner: { contains: filters.search, mode: "insensitive" } },
      { serialNumber: { contains: filters.search, mode: "insensitive" } },
      { fingerprint: { contains: filters.search, mode: "insensitive" } },
    ]
  }
  if (filters.expiry) {
    const days = parseInt(filters.expiry, 10)
    const limit = new Date()
    limit.setDate(limit.getDate() + days)
    const limitStr = limit.toISOString().slice(0, 10)
    const today = new Date().toISOString().slice(0, 10)
    where.expires = { gte: today, lte: limitStr }
  }
  const list = await prisma.certificate.findMany({ where })
  return list.map(mapCertToAPI)
}

export async function getCertificateById(id: number): Promise<Certificate | undefined> {
  const c = await prisma.certificate.findUnique({ where: { id } })
  return c ? mapCertToAPI(c) : undefined
}

export async function createCertificate(data: Omit<Certificate, "id">): Promise<Certificate> {
  const c = await prisma.certificate.create({
    data: {
      name: data.name,
      serialNumber: data.serialNumber,
      fingerprint: data.fingerprint,
      issuer: data.issuer,
      subject: data.subject,
      algorithm: data.algorithm,
      keySize: data.keySize,
      created: data.created,
      expires: data.expires,
      usage: data.usage,
      type: data.type,
      status: data.status,
      partner: data.partner,
      environment: data.environment,
    },
  })
  return mapCertToAPI(c)
}

export async function updateCertificate(
  id: number,
  data: Partial<Certificate>
): Promise<Certificate | undefined> {
  try {
    const c = await prisma.certificate.update({ where: { id }, data: data as Record<string, unknown> })
    return mapCertToAPI(c)
  } catch {
    return undefined
  }
}

export async function deleteCertificate(id: number): Promise<boolean> {
  try {
    await prisma.certificate.delete({ where: { id } })
    return true
  } catch {
    return false
  }
}

// ---------- Transactions ----------

function mapTrxToAPI(t: {
  id: string
  type: string
  typeName: string
  partner: string
  direction: string
  status: string
  date: string
  time: string
  size: string
  records: number
  controlNumber: string
  senderId: string
  receiverId: string
  raw: string
  logs: unknown
  errors: unknown
  environment: string
}): Transaction {
  return {
    id: t.id,
    type: t.type,
    typeName: t.typeName,
    partner: t.partner,
    direction: t.direction as "inbound" | "outbound",
    status: t.status as "completed" | "processing" | "error" | "pending",
    date: t.date,
    time: t.time,
    size: t.size,
    records: t.records,
    controlNumber: t.controlNumber,
    senderId: t.senderId,
    receiverId: t.receiverId,
    raw: t.raw,
    logs: (Array.isArray(t.logs) ? t.logs : []) as LogEntry[],
    errors: (Array.isArray(t.errors) ? t.errors : undefined) as ErrorEntry[] | undefined,
    environment: t.environment as "production" | "sandbox",
  }
}

export async function getTransactions(filters: {
  environment?: "production" | "sandbox"
  type?: string
  status?: string
  direction?: string
  partner?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}): Promise<Transaction[]> {
  const where: Record<string, unknown> = {}
  if (filters.environment) where.environment = filters.environment
  if (filters.type && filters.type !== "all") where.type = filters.type
  if (filters.status && filters.status !== "all") where.status = filters.status
  if (filters.direction && filters.direction !== "all") where.direction = filters.direction
  if (filters.partner && filters.partner !== "all") where.partner = filters.partner
  if (filters.dateFrom || filters.dateTo) {
    where.date = {}
    if (filters.dateFrom) (where.date as Record<string, string>).gte = filters.dateFrom
    if (filters.dateTo) (where.date as Record<string, string>).lte = filters.dateTo
  }
  if (filters.search) {
    where.OR = [
      { id: { contains: filters.search, mode: "insensitive" } },
      { partner: { contains: filters.search, mode: "insensitive" } },
      { controlNumber: { contains: filters.search, mode: "insensitive" } },
      { senderId: { contains: filters.search, mode: "insensitive" } },
      { receiverId: { contains: filters.search, mode: "insensitive" } },
    ]
  }
  const list = await prisma.transaction.findMany({
    where,
    orderBy: [{ date: "desc" }, { time: "desc" }],
  })
  return list.map(mapTrxToAPI)
}

export async function getTransactionById(id: string): Promise<Transaction | undefined> {
  const t = await prisma.transaction.findUnique({ where: { id } })
  return t ? mapTrxToAPI(t) : undefined
}

export async function createTransaction(data: Omit<Transaction, "id">): Promise<Transaction> {
  const t = await prisma.transaction.create({
    data: {
      type: data.type,
      typeName: data.typeName,
      partner: data.partner,
      direction: data.direction,
      status: data.status,
      date: data.date,
      time: data.time,
      size: data.size,
      records: data.records,
      controlNumber: data.controlNumber,
      senderId: data.senderId,
      receiverId: data.receiverId,
      raw: data.raw,
      logs: (data.logs ?? []) as object,
      errors: (data.errors ?? []) as object,
      environment: data.environment,
    },
  })
  return mapTrxToAPI(t)
}

// ---------- Notifications ----------

function mapNotifToAPI(n: {
  id: number
  type: string
  title: string
  message: string
  date: string
  time: string
  read: boolean
  archived: boolean
  environment: string
  action: unknown
  details: unknown
}): Notification {
  return {
    id: n.id,
    type: n.type as "warning" | "error" | "info",
    title: n.title,
    message: n.message,
    date: n.date,
    time: n.time,
    read: n.read,
    archived: n.archived,
    environment: n.environment as "production" | "sandbox",
    action: n.action as { label: string; href: string } | undefined,
    details: n.details as Record<string, string> | undefined,
  }
}

export async function getNotifications(filters: {
  environment?: "production" | "sandbox"
  type?: string
  showArchived?: boolean
}): Promise<Notification[]> {
  const where: Record<string, unknown> = {}
  if (filters.environment) where.environment = filters.environment
  if (filters.type && filters.type !== "all") where.type = filters.type
  if (filters.showArchived === false) where.archived = false
  const list = await prisma.notification.findMany({
    where,
    orderBy: [{ date: "desc" }, { time: "desc" }],
  })
  return list.map(mapNotifToAPI)
}

export async function getNotificationById(id: number): Promise<Notification | undefined> {
  const n = await prisma.notification.findUnique({ where: { id } })
  return n ? mapNotifToAPI(n) : undefined
}

export async function updateNotification(
  id: number,
  data: Partial<Notification>
): Promise<Notification | undefined> {
  try {
    const updateData: Record<string, unknown> = {}
    if (data.read != null) updateData.read = data.read
    if (data.archived != null) updateData.archived = data.archived
    const n = await prisma.notification.update({ where: { id }, data: updateData })
    return mapNotifToAPI(n)
  } catch {
    return undefined
  }
}

export async function markAllNotificationsRead(
  environment?: "production" | "sandbox"
): Promise<void> {
  const where: Record<string, unknown> = { archived: false }
  if (environment) where.environment = environment
  await prisma.notification.updateMany({
    where,
    data: { read: true },
  })
}

// ---------- Specifications ----------

export async function getUNISSpecifications(
  category?: string
): Promise<UNISSpecification[]> {
  const where = category && category !== "all"
    ? { category: { equals: category, mode: "insensitive" } }
    : {}
  const list = await prisma.unisSpecification.findMany({ where })
  return list.map((s) => ({
    code: s.code,
    name: s.name,
    description: s.description,
    category: s.category,
    version: s.version,
    lastUpdated: s.lastUpdated,
  }))
}

export async function getTPSpecifications(
  partner?: string,
  search?: string
): Promise<TPSpecification[]> {
  const and: Record<string, unknown>[] = []
  if (partner && partner !== "all") {
    and.push({ OR: [{ partner }, { partnerCode: partner }] })
  }
  if (search) {
    and.push({
      OR: [
        { messageType: { contains: search, mode: "insensitive" } },
        { messageName: { contains: search, mode: "insensitive" } },
        { partner: { contains: search, mode: "insensitive" } },
        { fileName: { contains: search, mode: "insensitive" } },
      ],
    })
  }
  const where = and.length ? { AND: and } : {}
  const list = await prisma.tpSpecification.findMany({ where })
  return list.map((s) => ({
    id: s.id,
    messageType: s.messageType,
    messageName: s.messageName,
    partner: s.partner,
    partnerCode: s.partnerCode,
    version: s.version,
    uploadedDate: s.uploadedDate,
    uploadedBy: s.uploadedBy,
    fileType: s.fileType as "PDF" | "Excel" | "X12" | "JSON",
    fileName: s.fileName,
    size: s.size,
  }))
}

export async function createTPSpecification(
  data: Omit<TPSpecification, "id">
): Promise<TPSpecification> {
  const s = await prisma.tpSpecification.create({
    data: {
      messageType: data.messageType,
      messageName: data.messageName,
      partner: data.partner,
      partnerCode: data.partnerCode,
      version: data.version,
      uploadedDate: data.uploadedDate,
      uploadedBy: data.uploadedBy,
      fileType: data.fileType,
      fileName: data.fileName,
      size: data.size,
    },
  })
  return {
    id: s.id,
    messageType: s.messageType,
    messageName: s.messageName,
    partner: s.partner,
    partnerCode: s.partnerCode,
    version: s.version,
    uploadedDate: s.uploadedDate,
    uploadedBy: s.uploadedBy,
    fileType: s.fileType as "PDF" | "Excel" | "X12" | "JSON",
    fileName: s.fileName,
    size: s.size,
  }
}
