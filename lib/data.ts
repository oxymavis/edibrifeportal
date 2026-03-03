/**
 * Unified data layer: uses Prisma (db-api) when DATABASE_URL is set,
 * otherwise falls back to in-memory store for local dev without a DB.
 */
import * as store from "@/lib/store"
import * as db from "@/lib/db-api"

const useDb = typeof process.env.DATABASE_URL === "string" && process.env.DATABASE_URL.length > 0

// Partners
export async function getPartners(environment?: "production" | "sandbox") {
  return useDb ? db.getPartners(environment) : Promise.resolve(store.getPartners(environment))
}

export async function getPartnerById(id: string) {
  return useDb ? db.getPartnerById(id) : Promise.resolve(store.getPartnerById(id))
}

export async function createPartner(data: Omit<store.TradingPartner, "id">) {
  return useDb ? db.createPartner(data) : Promise.resolve(store.createPartner(data))
}

export async function updatePartner(id: string, data: Partial<store.TradingPartner>) {
  return useDb ? db.updatePartner(id, data) : Promise.resolve(store.updatePartner(id, data))
}

export async function deletePartner(id: string) {
  return useDb ? db.deletePartner(id) : Promise.resolve(store.deletePartner(id))
}

// Certificates
export async function getCertificates(
  filters: Parameters<typeof store.getCertificates>[0]
) {
  return useDb ? db.getCertificates(filters) : Promise.resolve(store.getCertificates(filters))
}

export async function getCertificateById(id: number) {
  return useDb ? db.getCertificateById(id) : Promise.resolve(store.getCertificateById(id))
}

export async function createCertificate(data: Omit<store.Certificate, "id">) {
  return useDb ? db.createCertificate(data) : Promise.resolve(store.createCertificate(data))
}

export async function updateCertificate(id: number, data: Partial<store.Certificate>) {
  return useDb ? db.updateCertificate(id, data) : Promise.resolve(store.updateCertificate(id, data))
}

export async function deleteCertificate(id: number) {
  return useDb ? db.deleteCertificate(id) : Promise.resolve(store.deleteCertificate(id))
}

// Transactions
export async function getTransactions(
  filters: Parameters<typeof store.getTransactions>[0]
) {
  return useDb ? db.getTransactions(filters) : Promise.resolve(store.getTransactions(filters))
}

export async function getTransactionById(id: string) {
  return useDb ? db.getTransactionById(id) : Promise.resolve(store.getTransactionById(id))
}

export async function createTransaction(data: Omit<store.Transaction, "id">) {
  return useDb ? db.createTransaction(data) : Promise.resolve(store.createTransaction(data))
}

// Notifications
export async function getNotifications(
  filters: Parameters<typeof store.getNotifications>[0]
) {
  return useDb ? db.getNotifications(filters) : Promise.resolve(store.getNotifications(filters))
}

export async function getNotificationById(id: number) {
  return useDb ? db.getNotificationById(id) : Promise.resolve(store.getNotificationById(id))
}

export async function updateNotification(id: number, data: Partial<store.Notification>) {
  return useDb ? db.updateNotification(id, data) : Promise.resolve(store.updateNotification(id, data))
}

export async function markAllNotificationsRead(environment?: "production" | "sandbox") {
  if (useDb) await db.markAllNotificationsRead(environment)
  else store.markAllNotificationsRead(environment)
}

// Specifications
export async function getUNISSpecifications(category?: string) {
  return useDb ? db.getUNISSpecifications(category) : Promise.resolve(store.getUNISSpecifications(category))
}

export async function getTPSpecifications(partner?: string, search?: string) {
  return useDb ? db.getTPSpecifications(partner, search) : Promise.resolve(store.getTPSpecifications(partner, search))
}

export async function createTPSpecification(data: Omit<store.TPSpecification, "id">) {
  return useDb ? db.createTPSpecification(data) : Promise.resolve(store.createTPSpecification(data))
}
