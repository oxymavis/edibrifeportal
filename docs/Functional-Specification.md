# UNIS EDI Portal - Functional Specification Document

## Document Information

| Item | Description |
|------|-------------|
| Document Title | UNIS EDI Portal Functional Specification |
| Version | 2.0 |
| Date | February 2026 |
| Status | Updated |

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [User Authentication Module](#2-user-authentication-module)
3. [Dashboard Overview Module](#3-dashboard-overview-module)
4. [Trading Partner Management Module](#4-trading-partner-management-module)
5. [Certificate Management Module](#5-certificate-management-module)
6. [Message Specifications Module](#6-message-specifications-module)
7. [Transaction Management Module](#7-transaction-management-module)
8. [Notification System Module](#8-notification-system-module)
9. [Data Models](#9-data-models)
10. [User Interface Specifications](#10-user-interface-specifications)

---

## 1. System Overview

### 1.1 System Purpose

UNIS EDI Portal is a B2B Electronic Data Interchange (EDI) management platform that enables enterprises to:

- Manage EDI document exchanges with trading partners
- Handle X12 format document conversions (850, 855, 856, 810, 940-947, 204, 210, 214, 832, 846, 997)
- Manage SSL/TLS certificates for secure AS2 communications
- Monitor transaction statuses and processing logs
- Configure hierarchical trading partner structures (Parent-Subsidiary model)
- Configure message routing rules for outbound documents
- Manage message specifications per trading partner

### 1.2 Target Users

| User Type | Description |
|-----------|-------------|
| System Administrator | Full system access, user management, configuration |
| EDI Manager | Trading partner management, certificate management |
| Operations Staff | Transaction monitoring, document processing |
| Trading Partner Administrator (TPA) | Partner-specific configuration, specifications management |

### 1.3 Supported EDI Document Types

| Code | Name | Category | Direction |
|------|------|----------|-----------|
| 204 | Motor Carrier Load Tender | Transportation | Outbound |
| 210 | Freight Invoice | Transportation | Inbound |
| 214 | Shipment Status | Transportation | Both |
| 810 | Invoice | Financial | Outbound |
| 832 | Price/Sales Catalog | Inventory | Both |
| 846 | Inventory Inquiry/Advice | Inventory | Both |
| 850 | Purchase Order | Order Management | Inbound |
| 855 | Purchase Order Acknowledgment | Order Management | Outbound |
| 856 | Advance Ship Notice (ASN) | Shipping | Outbound |
| 940 | Warehouse Shipping Order | Warehouse | Inbound |
| 943 | Warehouse Stock Transfer Shipment | Warehouse | Both |
| 944 | Warehouse Stock Transfer Receipt | Warehouse | Inbound |
| 945 | Warehouse Shipping Advice | Warehouse | Outbound |
| 947 | Warehouse Inventory Adjustment | Warehouse | Both |
| 997 | Functional Acknowledgment | Acknowledgment | Both |

### 1.4 Environment Support

| Environment | Purpose | Color Indicator |
|-------------|---------|-----------------|
| Production | Live transactions with real trading partners | Green |
| Sandbox | Testing and development environment | Amber/Orange |

---

## 2. User Authentication Module

### 2.1 Functional Description

The authentication module provides secure user login and registration functionality for accessing the EDI Portal.

### 2.2 Features

#### 2.2.1 User Login

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Email | String | Yes | Valid email format |
| Password | String | Yes | Min 8 characters |

**Actions:**
- Sign In button
- Switch to Registration form
- Forgot Password link

#### 2.2.2 User Registration

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Full Name | String | Yes | Min 2 characters |
| Email | String | Yes | Valid email format, unique |
| Password | String | Yes | Min 8 chars, 1 uppercase, 1 number |
| Confirm Password | String | Yes | Must match password |

---

## 3. Dashboard Overview Module

### 3.1 Statistics Cards

| Metric | Description | Click Action |
|--------|-------------|--------------|
| Active Certificates | Count of active SSL/TLS certificates | Navigate to Certificates |
| Trading Partners | Count of configured trading partners | Navigate to Partners |
| Recent Transactions | Count of recent EDI transactions | Navigate to Transactions |
| Pending Actions | Count of items requiring attention | Navigate to Notifications |

### 3.2 Certificates Quick View

Displays recent certificates with:
- Certificate Name
- Type (Encryption/Signing/Server)
- Expiration Date
- Status (valid/expiring)
- "Manage Certificates" button

### 3.3 Recent Activity Feed

| Field | Type | Description |
|-------|------|-------------|
| Action | String | Description with partner name and code |
| Time | String | Relative timestamp |
| Status | Enum | success/warning/error |
| Partner | String | Trading partner name |
| Partner Code | String | Trading partner code (WMT, TGT, etc.) |

---

## 4. Trading Partner Management Module

### 4.1 Hierarchical Structure

The system supports a multi-level trading partner hierarchy:

```
Trading Partner (Parent)
├── Subsidiary 1 (Child)
│   ├── AS2 Profile 1
│   ├── AS2 Profile 2
│   └── Message Routing Rules
├── Subsidiary 2 (Child)
│   ├── AS2 Profile 1
│   └── Message Routing Rules
└── ...
```

### 4.2 Parent Trading Partner (TradingPartner)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Auto | Unique identifier |
| name | String | Yes | Organization name (e.g., "Walmart") |
| code | String | Yes | Short code (e.g., "WMT") |
| status | Enum | Yes | active / inactive |
| industry | String | Yes | Industry type |
| website | String | No | Company website URL |
| primaryContact | Object | Yes | Primary contact information |
| subsidiaries | Array | No | List of subsidiary companies |

**Primary Contact Object:**

| Field | Type | Required |
|-------|------|----------|
| name | String | Yes |
| email | String | Yes |
| phone | String | No |

### 4.3 Subsidiary (Child Company)

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Auto | Unique identifier |
| name | String | Yes | Subsidiary name (e.g., "Walmart US") |
| code | String | Yes | Short code (e.g., "WMT-US") |
| region | String | Yes | Geographic region |
| status | Enum | Yes | active / inactive |
| as2Profiles | Array | Yes | List of AS2 configurations |
| supportedDocTypes | Object | Yes | Supported document types by standard |

**Supported Document Types Object:**

| Field | Type | Description |
|-------|------|-------------|
| x12 | Array[String] | List of X12 document codes |
| edifact | Array[String] | List of EDIFACT message types |

### 4.4 AS2 Profile

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Auto | Unique identifier |
| name | String | Yes | Profile name (e.g., "Primary AS2") |
| as2Id | String | Yes | AS2 Identifier |
| as2Url | String | Yes | AS2 endpoint URL |
| status | Enum | Yes | active / standby / inactive |
| encryptionCert | String | No | Encryption certificate name |
| signingCert | String | No | Signing certificate name |
| mdnRequired | Boolean | Yes | MDN requirement flag |
| mdnSigned | Boolean | Yes | Signed MDN requirement |
| encryptionAlgorithm | String | Yes | e.g., "AES-256" |
| signatureAlgorithm | String | Yes | e.g., "SHA-256" |

### 4.5 Message Routing Configuration

Message routing is configured at the **Subsidiary level** only.

#### 4.5.1 Enabled Message Types

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| messageType | String | Yes | EDI document code |
| messageName | String | Yes | Document name |
| direction | Enum | Yes | inbound / outbound |
| enabled | Boolean | Yes | Activation status |

#### 4.5.2 Routing Rules

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Auto | Unique identifier |
| messageType | String | Yes | EDI document code |
| messageName | String | Yes | Document name |
| routingType | Enum | Yes | return_to_sender / specific_partner |
| targetPartner | String | Conditional | Target partner (if specific_partner) |
| targetSubsidiary | String | Conditional | Target subsidiary (if specific_partner) |
| enabled | Boolean | Yes | Rule activation status |
| description | String | No | Rule description |

### 4.6 Add Partner Modal (3-Step Wizard)

**Step 1: Basic Information**

| Field | Type | Required |
|-------|------|----------|
| Partner Name | String | Yes |
| Partner Code | String | Yes |
| Industry | Select | Yes |
| Website | String | No |
| Contact Name | String | Yes |
| Contact Email | String | Yes |
| Contact Phone | String | No |

**Step 2: AS2 Configuration**

| Field | Type | Required |
|-------|------|----------|
| AS2 ID | String | Yes |
| AS2 URL | String | Yes |
| MDN Required | Checkbox | Yes |
| MDN Signed | Checkbox | Yes |
| Encryption Algorithm | Select | Yes |
| Signature Algorithm | Select | Yes |

**Step 3: Document Types**

| Field | Type | Required |
|-------|------|----------|
| Document Types | Multi-checkbox | Yes (at least one) |

### 4.7 Environment Toggle

| Environment | Button Color | Indicator Color |
|-------------|--------------|-----------------|
| Production | Green (bg-green-600) | Green border/text |
| Sandbox | Amber (bg-amber-500) | Amber border/text |

---

## 5. Certificate Management Module

### 5.1 Environment Support

Certificates are managed separately for Production and Sandbox environments.

### 5.2 Certificate Entity

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Number | Auto | Unique identifier |
| name | String | Yes | Certificate display name |
| serialNumber | String | Auto | Certificate serial number |
| fingerprint | String | Auto | SHA-256 fingerprint |
| issuer | String | Auto | Certificate issuer |
| subject | String | Auto | Certificate subject (CN) |
| algorithm | String | Auto | Signing algorithm |
| keySize | String | Auto | Key size in bits |
| created | String | Auto | Upload date |
| expires | String | Auto | Expiration date |
| usage | Enum | Yes | Encryption / Signing / Server Auth / AS2 / SSL |
| type | String | Yes | X.509 / PKCS#12 / PEM |
| status | Enum | Auto | active / expiring / expired |
| partner | String | Yes | Associated trading partner |
| environment | Enum | Yes | production / sandbox |

### 5.3 Search and Filter

| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Name, Partner, Serial Number |
| Status | Select | All, Active, Expiring Soon, Expired |
| Expiration | Select | All, 30 days, 60 days, 90 days |
| Partner | Select | All partners list |

### 5.4 Certificate Upload Form

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| Target Environment | Radio | Yes | Production / Sandbox |
| Certificate File | File | Yes | .pem, .cer, .crt, .pfx, .p12 |
| Certificate Name | String | Yes | Display name |
| Trading Partner | Select | Yes | Partner association |
| Usage Purpose | Select | Yes | Encryption/Signing/Server Auth/AS2/SSL |
| Certificate Type | Select | Yes | X.509/PKCS#12/PEM |

### 5.5 UNIS Certificates Section

UNIS provides public certificates for trading partners to download.

#### 5.5.1 Search Methods

| Method | Description |
|--------|-------------|
| AS2 ID | Search by UNIS AS2 identifier |
| Serial Number | Search by certificate serial number |

#### 5.5.2 Quick Search Links (Production)

- UNIS-PROD-AS2
- UNIS-PROD-SFTP
- UNIS-PROD-API

#### 5.5.3 Quick Search Links (Sandbox)

- UNIS-TEST-AS2
- UNIS-TEST-SFTP
- UNIS-TEST-API

#### 5.5.4 UNIS Certificate Entity

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Certificate name |
| type | String | Certificate type |
| as2Id | String | Associated AS2 ID |
| serialNumber | String | Full serial number |
| validFrom | String | Valid from date |
| validTo | String | Expiration date |
| algorithm | String | Signing algorithm |
| keySize | String | Key size |
| fingerprint | String | SHA-256 fingerprint |
| environment | Enum | production / sandbox |

#### 5.5.5 Download Actions

- Select individual certificates (checkbox)
- Download Selected
- Download individual certificate
- Copy fingerprint

---

## 6. Message Specifications Module

### 6.1 Section Tabs

| Tab | Description |
|-----|-------------|
| UNIS Standard Specifications | Download UNIS standard EDI specifications |
| Trading Partner Specifications | Manage TP-specific specification documents |

### 6.2 UNIS Standard Specification

| Field | Type | Description |
|-------|------|-------------|
| code | String | EDI document code |
| name | String | Document name |
| description | String | Brief description |
| category | Enum | Order Management / Warehouse / Shipping / Financial / Inventory / Acknowledgment |
| version | String | Specification version |
| lastUpdated | String | Last update date |

#### 6.2.1 Available Downloads per Specification

| Document Type | Format | Description |
|---------------|--------|-------------|
| Implementation Guide | PDF | Detailed implementation instructions |
| Segment Directory | Excel | Field-level segment details |
| Sample Message | X12 | Example X12 formatted message |
| JSON Schema | JSON | JSON schema for validation |

#### 6.2.2 Category Filter Options

- All Categories
- Order Management (850, 855)
- Warehouse (940, 943, 944, 945, 947)
- Shipping (856, 204, 210, 214)
- Financial (810)
- Inventory (832, 846)
- Acknowledgment (997)

### 6.3 Trading Partner Specification

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | String | Auto | Unique identifier |
| messageType | String | Yes | EDI document code |
| messageName | String | Yes | Document name |
| partner | String | Yes | Trading partner name |
| partnerCode | String | Yes | Partner code |
| version | String | Yes | Specification version |
| uploadedDate | String | Auto | Upload timestamp |
| uploadedBy | String | Auto | Uploader email |
| fileType | Enum | Yes | PDF / Excel / X12 / JSON |
| fileName | String | Auto | Original file name |
| size | String | Auto | File size |

#### 6.3.1 Upload Form

| Field | Type | Required |
|-------|------|----------|
| Trading Partner | Select | Yes |
| Message Type | Select | Yes |
| Version | String | Yes |
| File Type | Select | Yes |
| File | File Upload | Yes |

#### 6.3.2 Filter Options

| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Message type, name, partner, filename |
| Partner | Select | All partners list |

---

## 7. Transaction Management Module

### 7.1 Environment Support

Transactions are viewed separately for Production and Sandbox environments.

### 7.2 Transaction Entity

| Field | Type | Description |
|-------|------|-------------|
| id | String | Transaction ID (e.g., TRX-850-001) |
| type | String | Document type code |
| typeName | String | Document type name |
| partner | String | Trading partner name |
| direction | Enum | inbound / outbound |
| status | Enum | completed / processing / error / pending |
| date | String | Transaction date |
| time | String | Transaction time |
| size | String | Document size |
| records | Number | Number of records |
| controlNumber | String | ISA control number |
| senderId | String | ISA sender ID |
| receiverId | String | ISA receiver ID |
| raw | String | Raw X12 content |
| logs | Array | Processing log entries |
| errors | Array | Error entries (if any) |

### 7.3 Search and Filter

| Filter | Type | Description |
|--------|------|-------------|
| Search | Text | Transaction ID, Partner, Control Number, Sender/Receiver ID |
| Document Type | Button Group | All Types + individual type buttons |
| Status | Select | All / Completed / Processing / Error / Pending |
| Direction | Select | All / Inbound / Outbound |
| Partner | Select | Trading partner list |
| Date From | Date | Start date filter |
| Date To | Date | End date filter |

### 7.4 Document Type Quick Filter

All 15 document types displayed as buttons:
204, 210, 214, 810, 832, 846, 850, 855, 856, 940, 943, 944, 945, 947, 997

### 7.5 Transaction Detail Modal

#### 7.5.1 Tabs

| Tab | Content |
|-----|---------|
| Raw X12 | Original X12 formatted document |
| Errors | Validation errors and warnings |
| Logs | Processing log entries |

#### 7.5.2 Error Entry

| Field | Type | Description |
|-------|------|-------------|
| code | String | Error code (e.g., VAL-001) |
| severity | Enum | error / warning |
| segment | String | X12 segment reference |
| position | String | Position in document |
| message | String | Error description |
| suggestion | String | Resolution suggestion |

#### 7.5.3 Log Entry

| Field | Type | Description |
|-------|------|-------------|
| timestamp | String | Log timestamp |
| level | Enum | info / success / error / warning |
| message | String | Log message |

### 7.6 Export Function

Export filtered transactions to CSV/Excel with columns:
- Transaction ID
- Document Type
- Type Name
- Partner
- Direction
- Status
- Date
- Time
- Size
- Records
- Control Number
- Sender ID
- Receiver ID

---

## 8. Notification System Module

### 8.1 Environment Support

Notifications are filtered by Production and Sandbox environments.

### 8.2 Notification Types

| Type | Icon | Color | Use Case |
|------|------|-------|----------|
| Warning | Alert Triangle | Orange/Amber | Certificate expiring, sync delays |
| Error | X Circle | Red | Connection failures, validation errors |
| Info | Info Circle | Blue | System updates, new features |

**Note:** Transaction success notifications have been removed from the system.

### 8.3 Notification Entity

| Field | Type | Description |
|-------|------|-------------|
| id | Number | Unique identifier |
| type | Enum | warning / error / info |
| title | String | Notification title |
| message | String | Detailed message |
| date | String | Notification date |
| time | String | Notification time |
| read | Boolean | Read status |
| archived | Boolean | Archive status |
| environment | Enum | production / sandbox |
| action | Object | Optional action link |
| details | Object | Additional details |

### 8.4 Notification Details Object

| Field | Type | Description |
|-------|------|-------------|
| partnerName | String | Related partner name |
| partnerCode | String | Related partner code |
| certificateName | String | Related certificate |
| expiresIn | String | Expiration period |
| errorCode | String | Error code reference |
| transactionId | String | Related transaction |
| endpoint | String | Related endpoint URL |

### 8.5 Filter Options

| Filter | Type | Options |
|--------|------|---------|
| Type | Button Group | All / Warning / Error / Info |
| Show Archived | Toggle | Yes / No |

### 8.6 Actions

| Action | Scope | Description |
|--------|-------|-------------|
| Mark All Read | Bulk | Mark all visible as read |
| Dismiss | Individual | Mark as read |
| Inactive | Individual | Archive notification |
| View Action | Individual | Navigate to related item |

---

## 9. Data Models

### 9.1 Complete TypeScript Interfaces

```typescript
// ==================== Trading Partner ====================

interface TradingPartner {
  id: string
  name: string
  code: string
  status: "active" | "inactive"
  industry: string
  website?: string
  primaryContact: {
    name: string
    email: string
    phone?: string
  }
  subsidiaries: Subsidiary[]
}

interface Subsidiary {
  id: string
  name: string
  code: string
  region: string
  status: "active" | "inactive"
  as2Profiles: AS2Profile[]
  supportedDocTypes: {
    x12: string[]
    edifact: string[]
  }
}

interface AS2Profile {
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

// ==================== Message Routing ====================

interface MessageTypeConfig {
  messageType: string
  messageName: string
  direction: "inbound" | "outbound"
  enabled: boolean
}

interface RoutingRule {
  id: string
  messageType: string
  messageName: string
  routingType: "return_to_sender" | "specific_partner"
  targetPartner?: string
  targetSubsidiary?: string
  enabled: boolean
  description?: string
}

// ==================== Certificate ====================

interface Certificate {
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
  usage: "Encryption" | "Signing" | "Server Auth" | "AS2 Communication" | "SSL"
  type: "X.509" | "PKCS#12" | "PEM"
  status: "active" | "expiring" | "expired"
  partner: string
  environment: "production" | "sandbox"
}

interface UNISCertificate {
  id: string
  name: string
  type: string
  as2Id: string
  serialNumber: string
  validFrom: string
  validTo: string
  algorithm: string
  keySize: string
  fingerprint: string
  environment: "production" | "sandbox"
}

// ==================== Transaction ====================

interface Transaction {
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
}

interface LogEntry {
  timestamp: string
  level: "info" | "success" | "error" | "warning"
  message: string
}

interface ErrorEntry {
  code: string
  severity: "error" | "warning"
  segment: string
  position: string
  message: string
  suggestion: string
}

// ==================== Specification ====================

interface UNISSpecification {
  code: string
  name: string
  description: string
  category: "Order Management" | "Warehouse" | "Shipping" | "Financial" | "Inventory" | "Acknowledgment"
  version: string
  lastUpdated: string
}

interface TPSpecification {
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

// ==================== Notification ====================

interface Notification {
  id: number
  type: "warning" | "error" | "info"
  title: string
  message: string
  date: string
  time: string
  read: boolean
  archived: boolean
  environment: "production" | "sandbox"
  action?: {
    label: string
    href: string
  }
  details?: {
    partnerName?: string
    partnerCode?: string
    certificateName?: string
    expiresIn?: string
    errorCode?: string
    transactionId?: string
    endpoint?: string
  }
}

// ==================== User ====================

interface User {
  id: string
  email: string
  name: string
  createdAt: Date
  lastLogin: Date
}
```

---

## 10. User Interface Specifications

### 10.1 Navigation Structure

```
+--------------------------------------------------+
|                    Header                         |
|  [Logo: EDI]  UNIS EDI Portal  [User] [Logout]   |
+--------------------------------------------------+
|  Sidebar    |           Main Content              |
|             |                                     |
| - Overview  |   [Tab Content Area]                |
| - Partners  |                                     |
| - Certs     |                                     |
| - Specs     |                                     |
| - Trans     |                                     |
| - Notifs    |                                     |
+-------------+-------------------------------------+
```

### 10.2 Navigation Order

1. Overview
2. Trading Partners
3. Certificates
4. Message Specifications
5. Transactions
6. Notifications

### 10.3 Environment Indicator Pattern

All modules that support environment separation display:
1. Environment toggle buttons in header (Production / Sandbox)
2. Environment indicator bar below header showing current environment
3. Data filtered by selected environment

### 10.4 Action Button Patterns

| Action Type | Style | Color |
|-------------|-------|-------|
| Primary Action | Solid | Primary (Blue) |
| Secondary Action | Outline | Border only |
| Destructive/Inactive | Outline | Amber (text-amber-600) |
| Download | Ghost | Primary text |

### 10.5 Status Indicators

| Status | Color | Background |
|--------|-------|------------|
| Active/Completed/Success | Green | bg-green-50, text-green-700 |
| Warning/Expiring/Standby | Amber | bg-amber-50, text-amber-700 |
| Error/Expired/Inactive | Red | bg-red-50, text-red-700 |
| Processing/Pending/Info | Blue | bg-blue-50, text-blue-700 |

### 10.6 Modal Specifications

| Property | Value |
|----------|-------|
| Overlay | Black 50% opacity |
| Max Width | 4xl (896px) - 6xl (1152px) |
| Max Height | 90vh |
| Position | Center of viewport |
| Scroll | Internal content scroll |

---

## Appendix A: Environment-Specific Features

| Module | Production/Sandbox Support |
|--------|---------------------------|
| Trading Partners | Yes |
| Certificates | Yes |
| Message Specifications | No (unified) |
| Transactions | Yes |
| Notifications | Yes |

## Appendix B: Error Codes

| Code | Category | Description |
|------|----------|-------------|
| VAL-001 | Validation | Missing required segment |
| VAL-002 | Validation | Invalid data element |
| VAL-003 | Validation | Segment out of order |
| CONN-001 | Connection | Partner endpoint unreachable |
| CONN-002 | Connection | AS2 handshake failed |
| CERT-001 | Certificate | Certificate expired |
| CERT-002 | Certificate | Certificate validation failed |
| AUTH-001 | Authentication | Invalid credentials |
| AUTH-002 | Authentication | Session expired |

---

*End of Document*
