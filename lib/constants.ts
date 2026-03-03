// Constants for EDI Portal
// Supported X12 document types per Functional Specification §1.3

export const EDI_DOCUMENT_TYPES = {
  "204": "Motor Carrier Load Tender",
  "210": "Freight Invoice",
  "214": "Shipment Status",
  "810": "Invoice",
  "832": "Price/Sales Catalog",
  "846": "Inventory Inquiry/Advice",
  "850": "Purchase Order",
  "855": "Purchase Order Acknowledgment",
  "856": "Advance Ship Notice (ASN)",
  "940": "Warehouse Shipping Order",
  "943": "Warehouse Stock Transfer Shipment",
  "944": "Warehouse Stock Transfer Receipt",
  "945": "Warehouse Shipping Advice",
  "947": "Warehouse Inventory Adjustment",
  "997": "Functional Acknowledgment",
} as const

/** All 15 supported EDI document type codes for dropdowns and multi-select */
export const EDI_DOCUMENT_TYPE_CODES = [
  "204", "210", "214", "810", "832", "846", "850", "855", "856",
  "940", "943", "944", "945", "947", "997",
] as const

export const PROTOCOLS = [
  { id: "https", label: "HTTPS", description: "Secure HTTP Protocol" },
  { id: "as2", label: "AS2", description: "Applicability Statement 2" },
  { id: "sftp", label: "SFTP", description: "SSH File Transfer Protocol" },
  { id: "ftp", label: "FTP", description: "File Transfer Protocol" },
] as const

export const SYNC_FREQUENCIES = [
  "Continuous",
  "Real-time",
  "Hourly",
  "Daily",
  "Weekly",
  "Monthly",
  "On-demand",
] as const

export const NOTIFICATION_TYPES = {
  warning: { color: "orange", icon: "AlertCircle" },
  error: { color: "red", icon: "AlertCircle" },
  success: { color: "green", icon: "CheckCircle" },
  info: { color: "blue", icon: "Clock" },
} as const

/** Certificate files in public/certificates/ that can be downloaded by name match */
export const DOWNLOADABLE_CERT_FILES: Record<string, string> = {
  LOGISTICSTEAM_SHA256_2031: "LOGISTICSTEAM_SHA256_2031.cer",
}

/** Returns public .cer filename if this cert has a downloadable file, else null */
export function getDownloadableCertFile(cert: { name?: string; fileName?: string }): string | null {
  const name = (cert.fileName ?? cert.name ?? "").replace(/\s+/g, "_").replace(/\.cer$/i, "")
  return DOWNLOADABLE_CERT_FILES[name] ?? null
}
