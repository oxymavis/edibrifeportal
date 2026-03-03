/**
 * Seed script: run with `pnpm db:seed` or `npx prisma db seed`.
 * Requires DATABASE_URL. Idempotent: skips UNIS specs that already exist.
 */
import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

const UNIS_SPECS = [
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

async function main() {
  for (const spec of UNIS_SPECS) {
    await prisma.unisSpecification.upsert({
      where: { code: spec.code },
      create: spec,
      update: {},
    })
  }
  console.log(`Seeded ${UNIS_SPECS.length} UNIS specifications.`)

  const partnerCount = await prisma.partner.count()
  if (partnerCount === 0) {
    const now = new Date().toISOString().slice(0, 10)
    const future = new Date()
    future.setFullYear(future.getFullYear() + 1)
    const expires = future.toISOString().slice(0, 10)
    await prisma.partner.create({
      data: {
        name: "Walmart",
        code: "WMT",
        status: "active",
        industry: "retail",
        website: "https://walmart.com",
        contactName: "EDI Team",
        contactEmail: "edi@walmart.com",
        contactPhone: "+1-800-925-6278",
        environment: "production",
        subsidiaries: {
          create: {
            name: "Walmart US",
            code: "WMT-US",
            region: "United States",
            status: "active",
            supportedDocTypesX12: ["850", "855", "856", "810", "940", "945", "997"],
            supportedDocTypesEdifact: [],
            as2Profiles: {
              create: {
                name: "Walmart US Primary",
                as2Id: "WALMART-US-PROD",
                as2Url: "https://as2.wal-mart.com/us",
                status: "active",
                mdnRequired: true,
                mdnSigned: true,
                encryptionAlgorithm: "AES-256",
                signatureAlgorithm: "SHA-256",
              },
            },
          },
        },
      },
    })
    await prisma.certificate.createMany({
      data: [
        { name: "Walmart US - Encryption", partner: "Walmart", serialNumber: "7A:8B:C1:D2", fingerprint: "3F:E2:4A:78", issuer: "DigiCert", subject: "CN=walmart-us", algorithm: "SHA256RSA", keySize: "2048", created: now, expires, usage: "Encryption", type: "X.509", status: "active", environment: "production" },
        { name: "Target Stores - AS2", partner: "Target", serialNumber: "1F:2E:3D:4C", fingerprint: "7C:E1:9F:A2", issuer: "Sectigo", subject: "CN=target-as2", algorithm: "SHA256RSA", keySize: "2048", created: "2022-03-20", expires: now, usage: "AS2 Communication", type: "X.509", status: "expiring", environment: "production" },
        { name: "LOGISTICSTEAM SHA256 2031", partner: "Logistics Team", serialNumber: "20:31:00:00:00", fingerprint: "SHA256", issuer: "Logistics Team CA", subject: "CN=LOGISTICSTEAM_SHA256_2031", algorithm: "SHA256RSA", keySize: "2048", created: now, expires, usage: "Signing", type: "X.509", status: "active", environment: "production" },
      ],
    })
    await prisma.notification.createMany({
      data: [
        { type: "warning", title: "Certificate Expiring Soon", message: "AS2 Certificate for Target Stores expires in 30 days", date: now, time: "14:30", read: false, archived: false, environment: "production" },
        { type: "info", title: "New Trading Partner Added", message: "Walmart has been configured.", date: now, time: "11:00", read: true, archived: false, environment: "production" },
      ],
    })
    console.log("Seeded initial partner, certificates, and notifications.")
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
