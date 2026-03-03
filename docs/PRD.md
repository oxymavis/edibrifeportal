# UNIS EDI Portal - Product Requirements Document (PRD)

## Document Control

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2024-01-XX | Product Team | Initial release |
| 2.0 | 2026-02-XX | Product Team | Major update: Hierarchical TP, Message Routing, Specifications |

---

## 1. Executive Summary

### 1.1 Product Overview

UNIS EDI Portal is a customer-facing web application designed to facilitate Electronic Data Interchange (EDI) between businesses and their trading partners. The platform enables customers to:

- Manage hierarchical trading partner structures (Parent-Subsidiary model)
- Submit and receive X12 EDI documents across 15 document types
- Manage SSL/TLS certificates for secure AS2 communications
- Configure message routing rules for outbound documents
- Manage message specifications per trading partner
- Monitor transaction statuses and processing logs in real-time

### 1.2 Business Objectives

- Simplify EDI integration for customers who lack native X12 capabilities
- Support complex enterprise structures with multi-level trading partner hierarchies
- Enable flexible message routing to multiple retail partners (Walmart, Target, Amazon, etc.)
- Provide environment separation (Production/Sandbox) for safe testing
- Reduce implementation time for new trading partners from weeks to days
- Enable real-time transaction visibility and status tracking

### 1.3 Target Audience

**Primary Users:**
- Supply chain managers
- Logistics coordinators
- EDI specialists
- Trading Partner Administrators (TPA)

**Secondary Users:**
- IT administrators
- Compliance officers

**User Personas:**
- Large retail platforms (Walmart, Target, Amazon) with multiple subsidiaries
- Third-party logistics providers (3PLs) handling multi-client operations
- EDI service providers (SPS Commerce) with complex routing needs
- Small-to-medium businesses without EDI infrastructure

### 1.4 Success Metrics

| Metric | Target |
|--------|--------|
| User onboarding completion rate | >80% |
| Transaction processing success rate | >99% |
| Average transaction submission time | <2 minutes |
| User satisfaction score (NPS) | >40 |
| Partner configuration time | <30 minutes |
| Message routing accuracy | >99.9% |

---

## 2. Product Scope

### 2.1 In Scope (Phase 2)

- User authentication and authorization
- Hierarchical trading partner management (Parent-Subsidiary-AS2 Profile)
- Multi-level AS2 configuration management
- Message type configuration per subsidiary
- Message routing rules (return to sender / specific partner)
- Certificate management with environment separation
- UNIS certificate distribution
- Message specifications management (UNIS standard + TP-specific)
- Transaction monitoring with 15 document types
- Advanced search and filtering
- Excel export functionality
- Real-time notification system
- Production/Sandbox environment separation

### 2.2 Out of Scope (Future Phases)

- Multi-tenancy and white-labeling
- Advanced analytics and reporting dashboards
- Automated partner onboarding workflows
- Webhook configuration UI
- Custom document type definitions
- Role-based access control (RBAC)
- Audit logging and compliance reporting
- API key management (removed in Phase 2)

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

#### 3.1.1 User Registration

**User Story:** As a new customer, I want to create an account so that I can access the EDI Portal.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-001 | System shall provide email/password registration | Must Have |
| FR-AUTH-002 | System shall validate email format and password strength (min 8 chars, 1 uppercase, 1 number) | Must Have |
| FR-AUTH-003 | System shall send verification email upon registration | Should Have |
| FR-AUTH-004 | System shall prevent duplicate email registrations | Must Have |
| FR-AUTH-005 | System shall display clear error messages for validation failures | Must Have |

**Acceptance Criteria:**
- User can complete registration in <60 seconds
- Password requirements are clearly communicated
- Success/error states are visually distinct

#### 3.1.2 User Login

**User Story:** As a registered user, I want to securely log in to access my account.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-AUTH-010 | System shall authenticate users with email and password | Must Have |
| FR-AUTH-011 | System shall implement session management with 24-hour expiry | Must Have |
| FR-AUTH-012 | System shall provide "Remember Me" option for 30-day sessions | Should Have |
| FR-AUTH-013 | System shall redirect authenticated users to dashboard | Must Have |
| FR-AUTH-014 | System shall handle authentication errors gracefully | Must Have |

---

### 3.2 Dashboard & Overview

#### 3.2.1 Dashboard Layout

**User Story:** As a user, I want a centralized dashboard to view my EDI activity at a glance.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-001 | System shall display dashboard with navigation sidebar | Must Have |
| FR-DASH-002 | System shall show user profile information in header | Must Have |
| FR-DASH-003 | System shall provide navigation to all major sections in order: Overview, Trading Partners, Certificates, Message Specifications, Transactions, Notifications | Must Have |
| FR-DASH-004 | System shall display current active tab state | Must Have |
| FR-DASH-005 | System shall be responsive on desktop and tablet devices | Must Have |

#### 3.2.2 Overview Tab

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-DASH-010 | System shall display clickable statistics cards for: Active Certificates, Trading Partners, Recent Transactions, Pending Actions | Must Have |
| FR-DASH-011 | System shall display certificates quick view with status | Must Have |
| FR-DASH-012 | System shall show recent activity with specific partner names and codes | Must Have |
| FR-DASH-013 | Clicking statistics cards shall navigate to corresponding module | Must Have |

---

### 3.3 Trading Partner Management

#### 3.3.1 Hierarchical Partner Structure

**User Story:** As an EDI manager, I want to configure hierarchical trading partner structures so that I can manage complex enterprise relationships like large retail platforms.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PARTNER-001 | System shall support 3-level hierarchy: Parent TP > Subsidiary > AS2 Profile | Must Have |
| FR-PARTNER-002 | System shall allow multiple subsidiaries per parent trading partner | Must Have |
| FR-PARTNER-003 | System shall allow multiple AS2 profiles per subsidiary | Must Have |
| FR-PARTNER-004 | System shall support both X12 and EDIFACT document standards per subsidiary | Should Have |

**Data Model - Trading Partner (Parent):**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | String | Auto | UUID format |
| name | String | Yes | Max 100 chars |
| code | String | Yes | Max 10 chars, uppercase |
| status | Enum | Yes | active / inactive |
| industry | String | Yes | From predefined list |
| website | String | No | Valid URL format |
| primaryContact.name | String | Yes | Max 50 chars |
| primaryContact.email | String | Yes | Valid email format |
| primaryContact.phone | String | No | Valid phone format |

**Data Model - Subsidiary:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | String | Auto | UUID format |
| name | String | Yes | Max 100 chars |
| code | String | Yes | Max 20 chars |
| region | String | Yes | From predefined list |
| status | Enum | Yes | active / inactive |
| supportedDocTypes.x12 | Array | No | Valid X12 codes |
| supportedDocTypes.edifact | Array | No | Valid EDIFACT types |

**Data Model - AS2 Profile:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | String | Auto | UUID format |
| name | String | Yes | Max 50 chars |
| as2Id | String | Yes | Max 128 chars |
| as2Url | String | Yes | Valid HTTPS URL |
| status | Enum | Yes | active / standby / inactive |
| encryptionCert | String | No | Valid certificate reference |
| signingCert | String | No | Valid certificate reference |
| mdnRequired | Boolean | Yes | Default: true |
| mdnSigned | Boolean | Yes | Default: true |
| encryptionAlgorithm | Enum | Yes | AES-128 / AES-256 / 3DES |
| signatureAlgorithm | Enum | Yes | SHA-1 / SHA-256 / SHA-512 |

#### 3.3.2 Partner Listing

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PARTNER-010 | System shall display parent trading partners in expandable card view | Must Have |
| FR-PARTNER-011 | System shall show subsidiary count and AS2 profile count per parent | Must Have |
| FR-PARTNER-012 | System shall support expand/collapse to view subsidiaries | Must Have |
| FR-PARTNER-013 | System shall display AS2 profiles within each subsidiary | Must Have |
| FR-PARTNER-014 | System shall show status indicators at all levels | Must Have |
| FR-PARTNER-015 | System shall support environment toggle (Production/Sandbox) | Must Have |

#### 3.3.3 Add Partner Wizard

**User Story:** As an administrator, I want a guided wizard to add new trading partners so that I don't miss required configuration.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PARTNER-020 | System shall provide 3-step wizard: Basic Info > AS2 Config > Document Types | Must Have |
| FR-PARTNER-021 | System shall validate each step before allowing progression | Must Have |
| FR-PARTNER-022 | System shall allow navigation back to previous steps | Must Have |
| FR-PARTNER-023 | System shall show progress indicator | Must Have |

**Step 1 - Basic Information Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Partner Name | Text | Yes | Max 100 chars |
| Partner Code | Text | Yes | Max 10 chars, uppercase only |
| Industry | Select | Yes | Predefined list |
| Website | Text | No | Valid URL |
| Contact Name | Text | Yes | Max 50 chars |
| Contact Email | Text | Yes | Valid email |
| Contact Phone | Text | No | Valid phone |

**Step 2 - AS2 Configuration Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| AS2 ID | Text | Yes | Max 128 chars |
| AS2 URL | Text | Yes | Valid HTTPS URL |
| MDN Required | Checkbox | Yes | Default: checked |
| MDN Signed | Checkbox | Yes | Default: checked |
| Encryption Algorithm | Select | Yes | AES-128/AES-256/3DES |
| Signature Algorithm | Select | Yes | SHA-1/SHA-256/SHA-512 |

**Step 3 - Document Types:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Document Types | Multi-select | Yes | At least one selected |

Available options: 204, 210, 214, 810, 832, 846, 850, 855, 856, 940, 943, 944, 945, 947, 997

#### 3.3.4 Message Routing Configuration

**User Story:** As a TPA, I want to configure message routing rules so that outbound documents (like 856 ASN) are sent to the correct retail partner.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-ROUTING-001 | Message routing shall be configured at subsidiary level only | Must Have |
| FR-ROUTING-002 | System shall allow enabling/disabling message types per subsidiary | Must Have |
| FR-ROUTING-003 | System shall support routing type: "Return to Inbound TP" | Must Have |
| FR-ROUTING-004 | System shall support routing type: "Specific Partner" with subsidiary selection | Must Have |
| FR-ROUTING-005 | System shall validate routing rules before saving | Must Have |

**Routing Rule Data Model:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | String | Auto | UUID format |
| messageType | String | Yes | Valid EDI code |
| messageName | String | Yes | Auto-populated |
| routingType | Enum | Yes | return_to_sender / specific_partner |
| targetPartner | String | Conditional | Required if specific_partner |
| targetSubsidiary | String | Conditional | Required if specific_partner |
| enabled | Boolean | Yes | Default: true |
| description | String | No | Max 200 chars |

#### 3.3.5 Partner Detail Modal

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-PARTNER-030 | System shall provide tabbed interface: Overview, AS2 Profiles, Documents, Specifications, Message Routing (subsidiary only) | Must Have |
| FR-PARTNER-031 | System shall display all AS2 profiles with copy functionality for IDs/URLs | Must Have |
| FR-PARTNER-032 | System shall allow inline editing of AS2 profile settings | Should Have |
| FR-PARTNER-033 | System shall show supported document types grouped by standard | Must Have |
| FR-PARTNER-034 | System shall provide "Inactive Profile" action (not delete) | Must Have |

---

### 3.4 Certificate Management

#### 3.4.1 Certificate Listing

**User Story:** As an IT administrator, I want to manage certificates separately for Production and Sandbox environments.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CERT-001 | System shall support environment toggle (Production/Sandbox) | Must Have |
| FR-CERT-002 | System shall display certificates filtered by environment | Must Have |
| FR-CERT-003 | System shall show certificate metadata: Name, SN, Partner, Usage, Type, Status, Expiration | Must Have |
| FR-CERT-004 | System shall highlight certificates expiring within 90 days | Must Have |

**Certificate Data Model:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | Number | Auto | Auto-increment |
| name | String | Yes | Max 100 chars |
| serialNumber | String | Auto | From certificate |
| fingerprint | String | Auto | SHA-256 |
| issuer | String | Auto | From certificate |
| subject | String | Auto | From certificate |
| algorithm | String | Auto | From certificate |
| keySize | String | Auto | From certificate |
| created | Date | Auto | Upload timestamp |
| expires | Date | Auto | From certificate |
| usage | Enum | Yes | Encryption / Signing / Server Auth / AS2 / SSL |
| type | Enum | Yes | X.509 / PKCS#12 / PEM |
| status | Enum | Auto | active / expiring / expired |
| partner | String | Yes | Trading partner reference |
| environment | Enum | Yes | production / sandbox |

#### 3.4.2 Certificate Search and Filter

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CERT-010 | System shall support search by: Name, Partner, Serial Number | Must Have |
| FR-CERT-011 | System shall support filter by: Status (All/Active/Expiring/Expired) | Must Have |
| FR-CERT-012 | System shall support filter by: Expiration period (30/60/90 days) | Must Have |
| FR-CERT-013 | System shall support filter by: Trading Partner | Should Have |
| FR-CERT-014 | System shall display result count | Must Have |

#### 3.4.3 Certificate Upload

**User Story:** As an administrator, I want to upload certificates with environment selection so that Production and Sandbox are properly separated.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CERT-020 | System shall require environment selection (Production/Sandbox) during upload | Must Have |
| FR-CERT-021 | System shall accept file formats: .pem, .cer, .crt, .pfx, .p12 | Must Have |
| FR-CERT-022 | System shall validate certificate format before acceptance | Must Have |
| FR-CERT-023 | System shall extract and display certificate metadata | Must Have |

**Upload Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Target Environment | Radio | Yes | production / sandbox |
| Certificate File | File | Yes | .pem/.cer/.crt/.pfx/.p12 |
| Certificate Name | Text | Yes | Max 100 chars |
| Trading Partner | Select | Yes | From partner list |
| Usage Purpose | Select | Yes | Encryption/Signing/Server Auth/AS2/SSL |
| Certificate Type | Select | Yes | X.509/PKCS#12/PEM |

#### 3.4.4 UNIS Certificates Section

**User Story:** As a trading partner, I want to search and download UNIS public certificates by AS2 ID or Serial Number.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-CERT-030 | System shall provide UNIS certificate search by AS2 ID or Serial Number | Must Have |
| FR-CERT-031 | System shall display environment-specific UNIS certificates | Must Have |
| FR-CERT-032 | System shall provide quick search links for common AS2 IDs | Should Have |
| FR-CERT-033 | System shall allow individual certificate download | Must Have |
| FR-CERT-034 | System shall allow batch download of selected certificates | Should Have |
| FR-CERT-035 | System shall provide copy fingerprint functionality | Must Have |

**UNIS Certificate Data Model:**

| Field | Type | Description |
|-------|------|-------------|
| id | String | Unique identifier |
| name | String | Certificate name |
| type | String | Certificate purpose |
| as2Id | String | UNIS AS2 identifier |
| serialNumber | String | Full serial number |
| validFrom | Date | Start date |
| validTo | Date | Expiration date |
| algorithm | String | Signing algorithm |
| keySize | String | Key size in bits |
| fingerprint | String | SHA-256 fingerprint |
| environment | Enum | production / sandbox |

**Quick Search Links - Production:**
- UNIS-PROD-AS2
- UNIS-PROD-SFTP
- UNIS-PROD-API

**Quick Search Links - Sandbox:**
- UNIS-TEST-AS2
- UNIS-TEST-SFTP
- UNIS-TEST-API

---

### 3.5 Message Specifications Management

#### 3.5.1 UNIS Standard Specifications

**User Story:** As a user, I want to download UNIS standard EDI specifications to implement document exchanges.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SPEC-001 | System shall display all 15 supported EDI document specifications | Must Have |
| FR-SPEC-002 | System shall support search by code, name, description | Must Have |
| FR-SPEC-003 | System shall support filter by category | Must Have |
| FR-SPEC-004 | System shall provide download for each specification type | Must Have |

**UNIS Specification Data Model:**

| Field | Type | Description |
|-------|------|-------------|
| code | String | EDI document code (e.g., "850") |
| name | String | Document name |
| description | String | Brief description |
| category | Enum | Order Management / Warehouse / Shipping / Financial / Inventory / Acknowledgment |
| version | String | Specification version |
| lastUpdated | Date | Last update date |

**Available Downloads per Specification:**

| Document Type | Format | Description |
|---------------|--------|-------------|
| Implementation Guide | PDF | Detailed implementation instructions |
| Segment Directory | Excel | Field-level segment details |
| Sample Message | X12 | Example X12 formatted message |
| JSON Schema | JSON | JSON schema for validation |

**Category Filter Options:**
- All Categories
- Order Management (850, 855)
- Warehouse (940, 943, 944, 945, 947)
- Shipping (856, 204, 210, 214)
- Financial (810)
- Inventory (832, 846)
- Acknowledgment (997)

#### 3.5.2 Trading Partner Specifications

**User Story:** As a TPA, I want to upload my company's specific EDI specifications so that integration partners can access them.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-SPEC-010 | System shall allow TP-specific specification upload | Must Have |
| FR-SPEC-011 | Specifications shall NOT be separated by environment | Must Have |
| FR-SPEC-012 | System shall support multiple file types per message type | Must Have |
| FR-SPEC-013 | System shall track upload history and version | Must Have |

**TP Specification Data Model:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| id | String | Auto | UUID format |
| messageType | String | Yes | Valid EDI code |
| messageName | String | Auto | From message type |
| partner | String | Yes | Trading partner name |
| partnerCode | String | Yes | Partner code |
| version | String | Yes | Max 20 chars |
| uploadedDate | Date | Auto | Upload timestamp |
| uploadedBy | String | Auto | User email |
| fileType | Enum | Yes | PDF / Excel / X12 / JSON |
| fileName | String | Auto | Original filename |
| size | String | Auto | File size |

**Upload Form Fields:**

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Trading Partner | Select | Yes | From partner list |
| Message Type | Select | Yes | From 15 supported types |
| Version | Text | Yes | Max 20 chars |
| File Type | Select | Yes | PDF/Excel/X12/JSON |
| File | File Upload | Yes | Max 10MB |

---

### 3.6 Transaction Management

#### 3.6.1 Transaction Listing

**User Story:** As an operations user, I want to search and filter transactions across all 15 document types.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TRANS-001 | System shall support environment toggle (Production/Sandbox) | Must Have |
| FR-TRANS-002 | System shall display transactions in chronological order (newest first) | Must Have |
| FR-TRANS-003 | System shall provide quick filter buttons for all 15 document types | Must Have |
| FR-TRANS-004 | System shall support advanced search and filtering | Must Have |
| FR-TRANS-005 | System shall provide Excel export functionality | Must Have |

**Transaction Data Model:**

| Field | Type | Description |
|-------|------|-------------|
| id | String | Transaction ID (e.g., TRX-850-001) |
| type | String | Document type code |
| typeName | String | Document type name |
| partner | String | Trading partner name |
| direction | Enum | inbound / outbound |
| status | Enum | completed / processing / error / pending |
| date | String | Transaction date (YYYY-MM-DD) |
| time | String | Transaction time (HH:MM:SS) |
| size | String | Document size |
| records | Number | Number of records/segments |
| controlNumber | String | ISA control number |
| senderId | String | ISA06 sender ID |
| receiverId | String | ISA08 receiver ID |
| raw | String | Raw X12 content |
| logs | Array | Processing log entries |
| errors | Array | Error entries (if any) |

#### 3.6.2 Search and Filter

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TRANS-010 | System shall support search by: Transaction ID, Partner, Control Number, Sender ID, Receiver ID | Must Have |
| FR-TRANS-011 | System shall support filter by: Document Type (15 types) | Must Have |
| FR-TRANS-012 | System shall support filter by: Status | Must Have |
| FR-TRANS-013 | System shall support filter by: Direction | Must Have |
| FR-TRANS-014 | System shall support filter by: Trading Partner | Must Have |
| FR-TRANS-015 | System shall support filter by: Date Range | Must Have |
| FR-TRANS-016 | System shall provide "Clear Filters" action | Must Have |
| FR-TRANS-017 | System shall display filter result count | Must Have |

**Filter Fields:**

| Filter | Type | Options |
|--------|------|---------|
| Search | Text | Free text search |
| Document Type | Button Group | All + 15 individual types |
| Status | Select | All / Completed / Processing / Error / Pending |
| Direction | Select | All / Inbound / Outbound |
| Partner | Select | All partners list |
| Date From | Date Picker | Start date |
| Date To | Date Picker | End date |

#### 3.6.3 Transaction Detail Modal

**User Story:** As a user, I want to view transaction details including raw X12, errors, and processing logs.

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TRANS-020 | System shall provide tabbed view: Raw X12, Errors, Logs | Must Have |
| FR-TRANS-021 | System shall display raw X12 with copy functionality | Must Have |
| FR-TRANS-022 | System shall display errors with severity, segment, position, message, and suggestion | Must Have |
| FR-TRANS-023 | System shall display processing logs with timestamp and level | Must Have |

**Error Entry Data Model:**

| Field | Type | Description |
|-------|------|-------------|
| code | String | Error code (e.g., VAL-001) |
| severity | Enum | error / warning |
| segment | String | X12 segment reference |
| position | String | Position in document |
| message | String | Error description |
| suggestion | String | Resolution suggestion |

**Log Entry Data Model:**

| Field | Type | Description |
|-------|------|-------------|
| timestamp | String | Log timestamp |
| level | Enum | info / success / error / warning |
| message | String | Log message |

#### 3.6.4 Export Function

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-TRANS-030 | System shall export filtered transactions to CSV/Excel | Must Have |
| FR-TRANS-031 | Export shall include all visible columns | Must Have |
| FR-TRANS-032 | Filename shall include environment and date | Should Have |

**Export Columns:**
Transaction ID, Document Type, Type Name, Partner, Direction, Status, Date, Time, Size, Records, Control Number, Sender ID, Receiver ID

---

### 3.7 Notification System

#### 3.7.1 Notification Types

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOTIF-001 | System shall support notification types: Warning, Error, Info | Must Have |
| FR-NOTIF-002 | System shall NOT generate success notifications for transactions | Must Have |
| FR-NOTIF-003 | System shall support environment separation | Must Have |

**Notification Types:**

| Type | Color | Icon | Use Cases |
|------|-------|------|-----------|
| Warning | Amber | Alert Triangle | Certificate expiring, sync delays, quota warnings |
| Error | Red | X Circle | Connection failures, validation errors, processing failures |
| Info | Blue | Info Circle | System updates, new features, maintenance notices |

#### 3.7.2 Notification Data Model

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| id | Number | Auto | Unique identifier |
| type | Enum | Yes | warning / error / info |
| title | String | Yes | Notification title |
| message | String | Yes | Detailed message |
| date | String | Yes | Notification date |
| time | String | Yes | Notification time |
| read | Boolean | Yes | Read status |
| archived | Boolean | Yes | Archive status |
| environment | Enum | Yes | production / sandbox |
| action | Object | No | Optional action link |
| details | Object | No | Additional context |

**Notification Details Object:**

| Field | Type | Description |
|-------|------|-------------|
| partnerName | String | Related partner name |
| partnerCode | String | Related partner code |
| certificateName | String | Related certificate |
| expiresIn | String | Expiration period |
| errorCode | String | Error code reference |
| transactionId | String | Related transaction |
| endpoint | String | Related endpoint URL |

#### 3.7.3 Notification Actions

**Requirements:**

| ID | Requirement | Priority |
|----|-------------|----------|
| FR-NOTIF-010 | System shall provide "Mark All Read" bulk action | Must Have |
| FR-NOTIF-011 | System shall provide "Dismiss" individual action | Must Have |
| FR-NOTIF-012 | System shall provide "Inactive" action (archive, not delete) | Must Have |
| FR-NOTIF-013 | System shall provide filter by type | Must Have |
| FR-NOTIF-014 | System shall provide "Show Archived" toggle | Should Have |

---

## 4. Non-Functional Requirements

### 4.1 Performance

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-PERF-001 | Page load time | <2 seconds |
| NFR-PERF-002 | Transaction list load | <1 second for 1000 records |
| NFR-PERF-003 | Certificate search response | <500ms |
| NFR-PERF-004 | Export generation | <5 seconds for 10,000 records |
| NFR-PERF-005 | Partner hierarchy expansion | <200ms |

### 4.2 Security

| ID | Requirement |
|----|-------------|
| NFR-SEC-001 | All data transmission shall use TLS 1.3 |
| NFR-SEC-002 | Passwords shall be hashed using bcrypt (cost factor 12) |
| NFR-SEC-003 | Session tokens shall be cryptographically secure |
| NFR-SEC-004 | System shall implement CSRF protection |
| NFR-SEC-005 | System shall sanitize all user inputs |
| NFR-SEC-006 | Certificate private keys shall never be exposed |

### 4.3 Scalability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-SCALE-001 | Registered users | 10,000 |
| NFR-SCALE-002 | Trading partners per user | 500 |
| NFR-SCALE-003 | Transactions per month | 1M |
| NFR-SCALE-004 | Certificates per user | 1,000 |
| NFR-SCALE-005 | Concurrent users | 100 |

### 4.4 Availability

| ID | Requirement | Target |
|----|-------------|--------|
| NFR-AVAIL-001 | System uptime | 99.5% |
| NFR-AVAIL-002 | Planned maintenance window | <2 hours monthly |
| NFR-AVAIL-003 | RTO (Recovery Time Objective) | 4 hours |
| NFR-AVAIL-004 | RPO (Recovery Point Objective) | 1 hour |

### 4.5 Usability

| ID | Requirement |
|----|-------------|
| NFR-USE-001 | Interface shall be responsive (desktop, tablet) |
| NFR-USE-002 | Color contrast shall meet WCAG 2.1 AA standards |
| NFR-USE-003 | Form validation errors shall be inline and actionable |
| NFR-USE-004 | Environment indicators shall be clearly visible |
| NFR-USE-005 | All actions shall provide visual feedback |

---

## 5. Technical Architecture

### 5.1 Technology Stack

**Frontend:**
- Framework: Next.js 16 (React 19.2)
- Language: TypeScript 5.x
- Styling: Tailwind CSS v4
- UI Components: shadcn/ui
- State Management: React Hooks, SWR
- Build Tool: Turbopack

**Backend:**
- Runtime: Next.js API Routes
- Language: TypeScript 5.x
- Authentication: Custom session-based

**Data Storage:**
- Database: PostgreSQL (recommended)
- File Storage: Vercel Blob / AWS S3
- Session Storage: Redis (recommended)

### 5.2 Module Dependencies

```
┌─────────────────────────────────────────────────────┐
│                   Authentication                     │
└─────────────────────────────────────────────────────┘
                         │
    ┌────────────────────┼────────────────────┐
    ▼                    ▼                    ▼
┌─────────┐      ┌─────────────┐      ┌─────────────┐
│ Trading │      │ Certificate │      │   Message   │
│ Partners│◄────►│ Management  │      │    Specs    │
└─────────┘      └─────────────┘      └─────────────┘
    │                    │                    │
    └────────────────────┼────────────────────┘
                         ▼
              ┌─────────────────────┐
              │    Transactions     │
              └─────────────────────┘
                         │
                         ▼
              ┌─────────────────────┐
              │    Notifications    │
              └─────────────────────┘
```

---

## 6. Glossary

| Term | Definition |
|------|------------|
| AS2 | Applicability Statement 2 - secure file transfer protocol |
| EDI | Electronic Data Interchange |
| EDIFACT | Electronic Data Interchange for Administration, Commerce and Transport |
| ISA | Interchange Control Header segment in X12 |
| MDN | Message Disposition Notification |
| TPA | Trading Partner Administrator |
| TP | Trading Partner |
| X12 | ANSI ASC X12 - US EDI standard |

---

## 7. Appendices

### Appendix A: Supported Document Types

| Code | Name | Category | Typical Direction |
|------|------|----------|-------------------|
| 204 | Motor Carrier Load Tender | Transportation | Outbound |
| 210 | Freight Invoice | Transportation | Inbound |
| 214 | Shipment Status | Transportation | Both |
| 810 | Invoice | Financial | Outbound |
| 832 | Price/Sales Catalog | Inventory | Both |
| 846 | Inventory Inquiry/Advice | Inventory | Both |
| 850 | Purchase Order | Order Management | Inbound |
| 855 | Purchase Order Acknowledgment | Order Management | Outbound |
| 856 | Advance Ship Notice | Shipping | Outbound |
| 940 | Warehouse Shipping Order | Warehouse | Inbound |
| 943 | Warehouse Stock Transfer Shipment | Warehouse | Both |
| 944 | Warehouse Stock Transfer Receipt | Warehouse | Inbound |
| 945 | Warehouse Shipping Advice | Warehouse | Outbound |
| 947 | Warehouse Inventory Adjustment | Warehouse | Both |
| 997 | Functional Acknowledgment | Acknowledgment | Both |

### Appendix B: Environment Feature Matrix

| Feature | Production | Sandbox |
|---------|------------|---------|
| Trading Partners | Yes | Yes |
| Certificates | Yes | Yes |
| UNIS Certificates | Yes | Yes |
| Message Specifications | Unified (no separation) | - |
| Transactions | Yes | Yes |
| Notifications | Yes | Yes |

### Appendix C: Error Codes

| Code | Category | Description |
|------|----------|-------------|
| VAL-001 | Validation | Missing required segment |
| VAL-002 | Validation | Invalid data element |
| VAL-003 | Validation | Segment out of order |
| VAL-004 | Validation | Invalid qualifier |
| CONN-001 | Connection | Partner endpoint unreachable |
| CONN-002 | Connection | AS2 handshake failed |
| CONN-003 | Connection | MDN not received |
| CERT-001 | Certificate | Certificate expired |
| CERT-002 | Certificate | Certificate validation failed |
| CERT-003 | Certificate | Certificate revoked |
| AUTH-001 | Authentication | Invalid credentials |
| AUTH-002 | Authentication | Session expired |
| ROUTE-001 | Routing | No routing rule configured |
| ROUTE-002 | Routing | Target partner inactive |

---

*End of Document*
