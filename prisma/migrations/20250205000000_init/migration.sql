-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "industry" TEXT NOT NULL DEFAULT 'retail',
    "website" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "environment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subsidiary" (
    "id" TEXT NOT NULL,
    "partnerId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "region" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "supportedDocTypesX12" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "supportedDocTypesEdifact" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "Subsidiary_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AS2Profile" (
    "id" TEXT NOT NULL,
    "subsidiaryId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "as2Id" TEXT NOT NULL,
    "as2Url" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "encryptionCert" TEXT,
    "signingCert" TEXT,
    "mdnRequired" BOOLEAN NOT NULL DEFAULT true,
    "mdnSigned" BOOLEAN NOT NULL DEFAULT true,
    "encryptionAlgorithm" TEXT NOT NULL DEFAULT 'AES-256',
    "signatureAlgorithm" TEXT NOT NULL DEFAULT 'SHA-256',

    CONSTRAINT "AS2Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Certificate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "fingerprint" TEXT NOT NULL,
    "issuer" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "algorithm" TEXT NOT NULL,
    "keySize" TEXT NOT NULL,
    "created" TEXT NOT NULL,
    "expires" TEXT NOT NULL,
    "usage" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'active',
    "partner" TEXT NOT NULL,
    "environment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Certificate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "typeName" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "direction" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "records" INTEGER NOT NULL DEFAULT 0,
    "controlNumber" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "raw" TEXT NOT NULL,
    "logs" JSONB NOT NULL DEFAULT '[]',
    "errors" JSONB,
    "environment" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Notification" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "environment" TEXT NOT NULL,
    "action" JSONB,
    "details" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UnisSpecification" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "lastUpdated" TEXT NOT NULL,

    CONSTRAINT "UnisSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TpSpecification" (
    "id" TEXT NOT NULL,
    "messageType" TEXT NOT NULL,
    "messageName" TEXT NOT NULL,
    "partner" TEXT NOT NULL,
    "partnerCode" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "uploadedDate" TEXT NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "fileType" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "size" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TpSpecification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UnisSpecification_code_key" ON "UnisSpecification"("code");

-- AddForeignKey
ALTER TABLE "Subsidiary" ADD CONSTRAINT "Subsidiary_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AS2Profile" ADD CONSTRAINT "AS2Profile_subsidiaryId_fkey" FOREIGN KEY ("subsidiaryId") REFERENCES "Subsidiary"("id") ON DELETE CASCADE ON UPDATE CASCADE;
