"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import CertificateModal from "../modals/certificate-modal"
import UNISCertificatesSection from "../unis-certificates-section"
import { apiClient } from "@/lib/api-client"
import { getDownloadableCertFile } from "@/lib/constants"
import { downloadText, safeFilename } from "@/lib/utils"

interface Certificate {
  id: number
  name: string
  serialNumber: string
  fingerprint: string
  expires: string
  usage: string
  status: string
  issuer: string
  subject: string
  algorithm: string
  keySize: string
  created: string
  type: string
  partner: string
  environment: "production" | "sandbox"
  filePath?: string
}

export default function CertificatesTab() {
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production")
  const [certificates, setCertificates] = useState<Certificate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCertificates = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await apiClient.getCertificates({ environment })
    if (res.success && Array.isArray(res.data)) {
      setCertificates(res.data)
    } else {
      setError(res.error ?? "Failed to load certificates")
      setCertificates([])
    }
    setLoading(false)
  }, [environment])

  useEffect(() => {
    fetchCertificates()
  }, [fetchCertificates])

  const [selectedCert, setSelectedCert] = useState<Certificate | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploadName, setUploadName] = useState("")
  const [uploadPartner, setUploadPartner] = useState("")
  const [uploadUsage, setUploadUsage] = useState("")
  const [uploadType, setUploadType] = useState("X.509")
  const [uploadError, setUploadError] = useState<string | null>(null)

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [usageFilter, setUsageFilter] = useState("all")
  const [expiryFilter, setExpiryFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "expired":
        return "bg-red-50 text-red-700 border-red-200"
      case "expiring":
        return "bg-orange-50 text-orange-700 border-orange-200"
      case "inactive":
        return "bg-gray-100 text-gray-700 border-gray-200"
      default:
        return "bg-green-50 text-green-700 border-green-200"
    }
  }

  const getStatusLabel = (status: string, daysLeft: number) => {
    switch (status) {
      case "expired":
        return "Expired"
      case "expiring":
        return `Expires in ${daysLeft} days`
      case "inactive":
        return "Inactive"
      default:
        return "Active"
    }
  }

  const getDaysUntilExpiry = (expiryDate: string) => {
    const exp = new Date(expiryDate)
    const today = new Date()
    const diff = exp.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Filter certificates
  const filteredCertificates = useMemo(() => {
    return certificates.filter((cert) => {
      // Environment filter
      if (cert.environment !== environment) return false

      // Search filter
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch =
        searchTerm === "" ||
        cert.name.toLowerCase().includes(searchLower) ||
        cert.serialNumber.toLowerCase().includes(searchLower) ||
        cert.fingerprint.toLowerCase().includes(searchLower) ||
        cert.issuer.toLowerCase().includes(searchLower) ||
        cert.subject.toLowerCase().includes(searchLower) ||
        cert.partner.toLowerCase().includes(searchLower)

      // Status filter
      const matchesStatus = statusFilter === "all" || cert.status === statusFilter

      // Usage filter
      const matchesUsage = usageFilter === "all" || cert.usage === usageFilter

      // Expiry filter
      const daysLeft = getDaysUntilExpiry(cert.expires)
      let matchesExpiry = true
      if (expiryFilter === "30days") {
        matchesExpiry = daysLeft <= 30 && daysLeft > 0
      } else if (expiryFilter === "90days") {
        matchesExpiry = daysLeft <= 90 && daysLeft > 0
      } else if (expiryFilter === "expired") {
        matchesExpiry = daysLeft <= 0
      }

      return matchesSearch && matchesStatus && matchesUsage && matchesExpiry
    })
  }, [certificates, searchTerm, statusFilter, usageFilter, expiryFilter, environment])

  const handleUpload = async () => {
    if (!uploadName || !uploadPartner || !uploadUsage) return
    setIsUploading(true)
    setUploadError(null)
    const res = await apiClient.uploadCertificate(
      uploadFile,
      uploadName,
      uploadUsage,
      uploadPartner,
      environment,
      uploadType
    )
    setIsUploading(false)
    if (!res.success) {
      setUploadError(res.error ?? "Upload failed")
      return
    }
    setShowUploadModal(false)
    setUploadFile(null)
    setUploadName("")
    setUploadPartner("")
    setUploadUsage("")
    setUploadType("X.509")
    await fetchCertificates()
  }

  const clearFilters = () => {
    setSearchTerm("")
    setStatusFilter("all")
    setUsageFilter("all")
    setExpiryFilter("all")
  }

  const usageOptions = [...new Set(certificates.filter(c => c.environment === environment).map((c) => c.usage))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Certificates</h2>
          <p className="text-muted-foreground">Manage SSL/TLS certificates for secure communication</p>
        </div>
        <div className="flex items-center gap-4">
          {/* Environment Toggle */}
          <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
            <button
              onClick={() => setEnvironment("production")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                environment === "production"
                  ? "bg-green-600 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Production
            </button>
            <button
              onClick={() => setEnvironment("sandbox")}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                environment === "sandbox"
                  ? "bg-amber-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Sandbox
            </button>
          </div>
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setShowUploadModal(true)}>
            Upload Certificate
          </Button>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-muted-foreground">Loading certificates...</div>
      )}
      {error && !loading && (
        <div className="py-4 px-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchCertificates()}>Retry</Button>
        </div>
      )}

      {/* Environment Indicator */}
      {!loading && (
      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
        environment === "production" 
          ? "bg-green-50 text-green-700 border border-green-200" 
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}>
        Currently viewing: <span className="font-bold uppercase">{environment}</span> environment certificates
      </div>
      )}

      {/* UNIS Certificates Download Section */}
      {!loading && <UNISCertificatesSection environment={environment} />}

      {/* Search and Filter Section */}
      {!loading && !error && (
      <>
      <Card className="p-4">
        <div className="space-y-4">
          {/* Search Bar */}
          <div>
            <Input
              type="text"
              placeholder="Search by name, partner, serial number, fingerprint, issuer or subject..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Filter Row */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="expiring">Expiring Soon</option>
                <option value="expired">Expired</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Usage:</label>
              <select
                value={usageFilter}
                onChange={(e) => setUsageFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Usage</option>
                {usageOptions.map((usage) => (
                  <option key={usage} value={usage}>
                    {usage}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-muted-foreground whitespace-nowrap">Expiry:</label>
              <select
                value={expiryFilter}
                onChange={(e) => setExpiryFilter(e.target.value)}
                className="px-3 py-2 rounded-md border border-input bg-background text-sm"
              >
                <option value="all">All Certificates</option>
                <option value="30days">Expires in 30 days</option>
                <option value="90days">Expires in 90 days</option>
                <option value="expired">Already Expired</option>
              </select>
            </div>

            <Button variant="outline" size="sm" onClick={clearFilters} className="bg-transparent">
              Clear Filters
            </Button>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground">
            Showing {filteredCertificates.length} of {certificates.filter(c => c.environment === environment).length} certificates
          </div>
        </div>
      </Card>

      {/* Upload Modal */}
      {showUploadModal && (
        <Card className="p-6 bg-secondary/20 border-2 border-dashed border-primary/30 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="font-semibold text-foreground">Upload New Certificate</h3>
          </div>

          {/* Environment Selection for Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Target Environment *</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadEnv"
                  value="production"
                  defaultChecked={environment === "production"}
                  className="w-4 h-4 accent-green-600"
                />
                <span className="px-3 py-1 rounded text-sm font-medium bg-green-50 text-green-700 border border-green-200">
                  Production
                </span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="uploadEnv"
                  value="sandbox"
                  defaultChecked={environment === "sandbox"}
                  className="w-4 h-4 accent-amber-500"
                />
                <span className="px-3 py-1 rounded text-sm font-medium bg-amber-50 text-amber-700 border border-amber-200">
                  Sandbox
                </span>
              </label>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Select the environment where this certificate will be used
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Certificate File *</label>
            <Input
              type="file"
              accept=".pem,.cer,.crt,.pfx,.p12"
              disabled={isUploading}
              className="cursor-pointer"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Certificate Name *</label>
            <Input
              type="text"
              placeholder="e.g., Walmart US - Encryption"
              disabled={isUploading}
              value={uploadName}
              onChange={(e) => setUploadName(e.target.value)}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Trading Partner *</label>
            <select
              className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
              value={uploadPartner}
              onChange={(e) => setUploadPartner(e.target.value)}
              disabled={isUploading}
            >
              <option value="">Select partner</option>
              <option value="Walmart">Walmart</option>
              <option value="Target">Target</option>
              <option value="Amazon">Amazon</option>
              <option value="SPS Commerce">SPS Commerce</option>
              <option value="Costco">Costco</option>
              <option value="UNIS (Self)">UNIS (Self)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Usage Purpose *</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={uploadUsage}
                onChange={(e) => setUploadUsage(e.target.value)}
                disabled={isUploading}
              >
                <option value="">Select usage</option>
                <option value="Encryption">Encryption</option>
                <option value="Signing">Signing</option>
                <option value="Server Auth">Server Auth</option>
                <option value="AS2 Communication">AS2 Communication</option>
                <option value="SSL">SSL</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Certificate Type *</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={uploadType}
                onChange={(e) => setUploadType(e.target.value)}
                disabled={isUploading}
              >
                <option value="X.509">X.509</option>
                <option value="PKCS#12">PKCS#12</option>
                <option value="PEM">PEM</option>
              </select>
            </div>
          </div>

          {uploadError && (
            <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
              {uploadError}
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleUpload}
              disabled={isUploading || !uploadName || !uploadPartner || !uploadUsage}
              title={!uploadName || !uploadPartner || !uploadUsage ? "Please fill required fields" : undefined}
              className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            >
              {isUploading ? "Uploading..." : "Upload"}
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUploadModal(false)}
              disabled={isUploading}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      {/* Certificates List */}
      <div className="space-y-3">
        {filteredCertificates.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No certificates found matching your criteria.</p>
            <Button variant="link" onClick={clearFilters} className="mt-2">
              Clear filters
            </Button>
          </Card>
        ) : (
          filteredCertificates.map((cert) => {
            const daysLeft = getDaysUntilExpiry(cert.expires)
            return (
              <Card
                key={cert.id}
                className="p-6 border border-border hover:border-primary/30 hover:shadow-sm transition-all"
              >
                <div className="space-y-4">
                  {/* Header Row */}
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg text-foreground">{cert.name}</h3>
                        {cert.partner === "UNIS (Self)" && (
                          <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-100 text-blue-700">
                            UNIS
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">
                        Partner: <span className="font-semibold text-foreground">{cert.partner}</span>
                      </p>
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground font-mono">
                          <span className="text-foreground font-semibold">SN:</span> {cert.serialNumber}
                        </p>
                        <p className="text-xs text-muted-foreground font-mono">
                          <span className="text-foreground font-semibold">Fingerprint:</span> {cert.fingerprint}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap ${getStatusColor(cert.status)}`}
                    >
                      {getStatusLabel(cert.status, daysLeft)}
                    </span>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 text-sm border-t border-border pt-4">
                    <div>
                      <p className="text-muted-foreground mb-1">Issuer</p>
                      <p className="font-medium text-foreground">{cert.issuer}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Subject</p>
                      <p className="font-mono text-foreground text-xs truncate" title={cert.subject}>
                        {cert.subject}
                      </p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Algorithm</p>
                      <p className="font-medium text-foreground">{cert.algorithm}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Key Size</p>
                      <p className="font-medium text-foreground">{cert.keySize} bits</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground mb-1">Type</p>
                      <p className="font-medium text-foreground">{cert.type}</p>
                    </div>
                  </div>

                  {/* Dates Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm border-t border-border pt-4">
                    <div>
                      <p className="text-muted-foreground">Created</p>
                      <p className="font-medium text-foreground">{cert.created}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Expires</p>
                      <p className="font-medium text-foreground">{cert.expires}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Usage</p>
                      <p className="font-medium text-foreground">{cert.usage}</p>
                    </div>

                    <div>
                      <p className="text-muted-foreground">Days Remaining</p>
                      <p className={`font-medium ${daysLeft <= 0 ? "text-red-600" : daysLeft <= 30 ? "text-orange-600" : "text-foreground"}`}>
                        {daysLeft <= 0 ? "Expired" : `${daysLeft} days`}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2 border-t border-border pt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => setSelectedCert(cert)}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => {
                        if (cert.filePath) {
                          window.open(apiClient.certificateDownloadUrl(cert.id), "_blank")
                          return
                        }
                        const certFile = getDownloadableCertFile(cert)
                        if (certFile) {
                          const a = document.createElement("a")
                          a.href = `/certificates/${certFile}`
                          a.download = safeFilename(certFile)
                          a.click()
                        } else {
                          const text = `Certificate: ${cert.name}\nPartner: ${cert.partner}\nSerial: ${cert.serialNumber}\nFingerprint: ${cert.fingerprint}\nIssuer: ${cert.issuer}\nSubject: ${cert.subject}\nAlgorithm: ${cert.algorithm}\nKey Size: ${cert.keySize}\nValid: ${cert.created} - ${cert.expires}\nUsage: ${cert.usage}\nStatus: ${cert.status}`
                          downloadText(`certificate_${(cert.name ?? "cert").replace(/\s+/g, "_")}.txt`, text)
                        }
                      }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                      onClick={async () => {
                        const res = await apiClient.updateCertificate(cert.id, { status: "inactive" })
                        if (res.success) {
                          setCertificates((prev) => prev.map((c) => (c.id === cert.id ? { ...c, status: "inactive" } : c)))
                        }
                      }}
                    >
                      Inactive
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })
        )}
      </div>
      </>
      )}

      {/* Certificate Details Modal */}
      {selectedCert && <CertificateModal cert={selectedCert} onClose={() => setSelectedCert(null)} />}
    </div>
  )
}
