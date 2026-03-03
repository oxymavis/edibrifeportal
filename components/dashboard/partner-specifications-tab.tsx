"use client"

import { useCallback, useMemo, useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { apiClient } from "@/lib/api-client"
import { downloadText, safeFilename } from "@/lib/utils"

interface PartnerSpecificationsTabProps {
  partnerName: string
  partnerCode: string
}

interface TpSpec {
  id: string
  messageType: string
  messageName: string
  partner: string
  partnerCode: string
  version: string
  uploadedDate: string
  uploadedBy: string
  fileType: string
  fileName: string
  size: string
  filePath?: string
  status?: string
}

const messageTypes = [
  { code: "204", name: "Motor Carrier Load Tender" },
  { code: "210", name: "Freight Invoice" },
  { code: "214", name: "Shipment Status" },
  { code: "810", name: "Invoice" },
  { code: "832", name: "Price/Sales Catalog" },
  { code: "846", name: "Inventory Inquiry/Advice" },
  { code: "850", name: "Purchase Order" },
  { code: "855", name: "Purchase Order Ack" },
  { code: "856", name: "Advance Ship Notice" },
  { code: "940", name: "Warehouse Shipping Order" },
  { code: "943", name: "Warehouse Stock Transfer" },
  { code: "944", name: "Warehouse Stock Receipt" },
  { code: "945", name: "Warehouse Shipping Advice" },
  { code: "947", name: "Warehouse Inventory Adj" },
  { code: "997", name: "Functional Acknowledgment" },
]

function extToFileType(fileName: string) {
  const ext = fileName.split(".").pop()?.toLowerCase()
  if (ext === "pdf") return "PDF"
  if (ext === "xls" || ext === "xlsx") return "EXCEL"
  if (ext === "json") return "JSON"
  if (ext === "xml") return "XML"
  if (ext === "edi" || ext === "x12" || ext === "txt") return "X12"
  return "TXT"
}

export default function PartnerSpecificationsTab({ partnerName, partnerCode }: PartnerSpecificationsTabProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [specs, setSpecs] = useState<TpSpec[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [uploadMessageType, setUploadMessageType] = useState("")
  const [uploadVersion, setUploadVersion] = useState("")
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const fetchSpecs = useCallback(async () => {
    setLoading(true)
    setError(null)
    const byCode = await apiClient.getSpecifications({ section: "tp", partnerCode })
    let rows = byCode.success && Array.isArray(byCode.data) ? byCode.data : []
    if (rows.length === 0) {
      const byName = await apiClient.getSpecifications({ section: "tp", partner: partnerName })
      if (byName.success && Array.isArray(byName.data)) rows = byName.data
    }

    if (Array.isArray(rows)) {
      setSpecs(rows)
    } else {
      setSpecs([])
      setError("Failed to load specifications")
    }
    setLoading(false)
  }, [partnerCode, partnerName])

  useEffect(() => {
    fetchSpecs()
  }, [fetchSpecs])

  const grouped = useMemo(() => {
    const map = new Map<string, TpSpec[]>()
    for (const spec of specs) {
      const list = map.get(spec.messageType) ?? []
      list.push(spec)
      map.set(spec.messageType, list)
    }
    return [...map.values()]
      .map((items) => {
        const ordered = [...items].sort((a, b) => {
          const aActive = (a.status || "active") === "active" ? 1 : 0
          const bActive = (b.status || "active") === "active" ? 1 : 0
          if (aActive !== bActive) return bActive - aActive
          return `${b.uploadedDate}${b.id}`.localeCompare(`${a.uploadedDate}${a.id}`)
        })
        return {
          messageType: ordered[0].messageType,
          messageName: ordered[0].messageName,
          latest: ordered[0],
          files: ordered,
          versions: [...new Set(ordered.map((x) => x.version))],
        }
      })
      .sort((a, b) => a.messageType.localeCompare(b.messageType))
  }, [specs])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return grouped
    return grouped.filter((g) =>
      g.messageType.toLowerCase().includes(q) ||
      g.messageName.toLowerCase().includes(q) ||
      g.latest.version.toLowerCase().includes(q) ||
      g.files.some((f) => f.fileName.toLowerCase().includes(q))
    )
  }, [grouped, searchQuery])

  const handleUpload = async () => {
    if (!uploadMessageType || !uploadVersion) return
    setUploading(true)
    const mt = messageTypes.find((m) => m.code === uploadMessageType)
    const res = uploadFile
      ? await apiClient.uploadSpecificationFile({
          messageType: uploadMessageType,
          messageName: mt?.name ?? uploadMessageType,
          partner: partnerName,
          partnerCode,
          version: uploadVersion,
          file: uploadFile,
        })
      : await apiClient.createSpecification({
          messageType: uploadMessageType,
          messageName: mt?.name ?? uploadMessageType,
          partner: partnerName,
          partnerCode,
          version: uploadVersion,
          fileType: "TXT",
          fileName: `${partnerCode}_${uploadMessageType}_${uploadVersion}.txt`,
          size: "0 KB",
        })
    setUploading(false)
    if (!res.success) {
      setError(res.error ?? "Upload failed")
      return
    }
    setShowUploadModal(false)
    setUploadMessageType("")
    setUploadVersion("")
    setUploadFile(null)
    await fetchSpecs()
  }

  const toggleSpecStatus = async (spec: TpSpec) => {
    const nextStatus = (spec.status || "active") === "active" ? "inactive" : "active"
    const res = await apiClient.updateSpecification(spec.id, { status: nextStatus })
    if (res.success) await fetchSpecs()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-lg text-foreground">Message Specifications</h3>
          <p className="text-sm text-muted-foreground">Manage TP-specific specs for {partnerName} ({partnerCode})</p>
        </div>
        <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setShowUploadModal(true)}>
          + Upload Specification
        </Button>
      </div>

      <div className="flex gap-4">
        <Input
          type="text"
          placeholder="Search by message type, name, version or file..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <span className="text-sm text-muted-foreground self-center">{filtered.length} message type(s)</span>
      </div>

      {loading && <div className="py-6 text-center text-muted-foreground">Loading specifications...</div>}
      {error && !loading && <Card className="p-4 border-destructive/30 text-destructive bg-destructive/10">{error}</Card>}

      {!loading && (
        <div className="space-y-4">
          {filtered.map((group) => (
            <Card key={group.messageType} className="border border-border overflow-hidden">
              <div
                className="p-4 cursor-pointer hover:bg-secondary/30 transition-colors"
                onClick={() => setSelectedType(selectedType === group.messageType ? null : group.messageType)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-bold text-lg">{group.messageType}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-foreground">{group.messageName}</h4>
                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">{group.latest.version}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">Latest upload: {group.latest.uploadedDate} by {group.latest.uploadedBy}</p>
                    </div>
                  </div>
                  <span className="text-sm text-muted-foreground">{group.files.length} file(s)</span>
                </div>
              </div>

              {selectedType === group.messageType && (
                <div className="border-t border-border bg-secondary/20 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <h5 className="font-medium text-foreground">Files</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => {
                        const text = group.files
                          .map((f) => `${f.messageType} ${f.messageName} | ${f.version} | ${f.fileName} | ${f.size} | ${f.uploadedDate}`)
                          .join("\n")
                        downloadText(`${safeFilename(partnerCode)}_${group.messageType}_spec_history.txt`, text)
                      }}
                    >
                      Download History
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {group.files.map((file) => (
                      <div key={file.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
                        <div>
                          <p className="text-sm font-medium text-foreground">{file.fileName}</p>
                          <p className="text-xs text-muted-foreground">
                            {file.fileType} • {file.size} • {file.uploadedDate}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex items-center px-2 py-1 rounded text-xs ${
                            (file.status || "active") === "active"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {(file.status || "active") === "active" ? "Active" : "Inactive"}
                          </span>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary"
                            onClick={() => {
                              if (file.filePath) {
                                window.open(apiClient.specificationDownloadUrl(file.id), "_blank")
                                return
                              }
                              const text = `Specification: ${file.messageType} - ${file.messageName}\nPartner: ${file.partner} (${file.partnerCode})\nVersion: ${file.version}\nFile: ${file.fileName}\nType: ${file.fileType}\nSize: ${file.size}\nUploaded: ${file.uploadedDate} by ${file.uploadedBy}`
                              const base = file.fileName ? file.fileName.replace(/\.[^.]+$/, "") : "spec"
                              downloadText(`${safeFilename(base)}_info.txt`, text)
                            }}
                          >
                            Download
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-amber-600 hover:text-amber-700"
                            onClick={() => toggleSpecStatus(file)}
                          >
                            {(file.status || "active") === "active" ? "Set Inactive" : "Set Active"}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-border">
                    <h5 className="font-medium text-foreground mb-2">Version History</h5>
                    <div className="space-y-1 text-sm text-muted-foreground">
                      {group.versions.map((v) => (
                        <div key={v} className="flex items-center justify-between">
                          <span>{v}</span>
                          <span>{group.files.find((x) => x.version === v)?.uploadedDate}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {!loading && filtered.length === 0 && (
        <Card className="p-8 text-center border border-border">
          <p className="text-muted-foreground mb-4">No specifications found for this partner.</p>
          <Button onClick={() => setShowUploadModal(true)}>Upload First Specification</Button>
        </Card>
      )}

      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4">
          <Card className="w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Upload Specification</h3>
              <button onClick={() => setShowUploadModal(false)} className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary">X</button>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Message Type *</label>
              <select
                className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm"
                value={uploadMessageType}
                onChange={(e) => setUploadMessageType(e.target.value)}
              >
                <option value="">Select message type</option>
                {messageTypes.map((mt) => (
                  <option key={mt.code} value={mt.code}>{mt.code} - {mt.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Version *</label>
              <Input type="text" placeholder="e.g., v2.0" value={uploadVersion} onChange={(e) => setUploadVersion(e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-2">Upload File</label>
              <Input
                type="file"
                accept=".pdf,.xlsx,.xls,.json,.xml,.edi,.x12,.txt"
                onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleUpload} disabled={uploading || !uploadMessageType || !uploadVersion}>
                {uploading ? "Uploading..." : "Upload"}
              </Button>
              <Button variant="outline" className="flex-1 bg-transparent" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
