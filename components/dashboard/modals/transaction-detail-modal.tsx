"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { downloadText } from "@/lib/utils"
import { apiClient } from "@/lib/api-client"

type TabType = "raw" | "errors" | "logs"

export default function TransactionDetailModal({
  transaction,
  onClose,
  onOpenTransaction,
}: {
  transaction: any
  onClose: () => void
  onOpenTransaction?: (id: string) => void
}) {
  const [activeTab, setActiveTab] = useState<TabType>("raw")
  const [copied, setCopied] = useState(false)
  const [related, setRelated] = useState<{ upstream: any[]; downstream: any[] }>({ upstream: [], downstream: [] })

  useEffect(() => {
    apiClient.getTransactionRelated(transaction.id).then((res) => {
      if (res.success && res.data) setRelated(res.data)
      else setRelated({ upstream: [], downstream: [] })
    })
  }, [transaction.id])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Use transaction.errors if present (may include suggestion), else mock by status
  const errors: Array<{ code: string; severity: string; segment: string; position: string; message: string; details: string; suggestion?: string }> =
    Array.isArray(transaction.errors) && transaction.errors.length > 0
      ? transaction.errors
      : transaction.status === "error"
        ? [
            {
              code: "EDI-001",
              severity: "error",
              segment: "ST",
              position: "1",
              message: "Missing required segment ST (Transaction Set Header)",
              details: "The ST segment is required at the beginning of each transaction set. This segment was not found in the expected position.",
              suggestion: "Add an ST segment at the start of the transaction set with the correct transaction set identifier (e.g. ST*204*0001).",
            },
            {
              code: "EDI-002",
              severity: "error",
              segment: "BFR",
              position: "2",
              message: "Invalid element value in BFR01",
              details: "The value '999' in element BFR01 is not a valid qualifier. Expected values: 00, 01, 02, 03.",
              suggestion: "Use BFR01 value 00 (Original), 01 (Cancel), 02 (Replace), or 03 (Delete) per X12 standards.",
            },
            {
              code: "EDI-003",
              severity: "warning",
              segment: "DTM",
              position: "5",
              message: "Date format mismatch in DTM02",
              details: "The date '2024115' does not conform to the expected format CCYYMMDD. Missing leading zero.",
              suggestion: "Format the date as CCYYMMDD, e.g. 20240115 for January 15, 2024.",
            },
          ]
        : transaction.status === "processing"
          ? [
              {
                code: "EDI-W01",
                severity: "warning",
                segment: "N1",
                position: "12",
                message: "Optional segment N1 has incomplete data",
                details: "The N1 segment is present but N103 (identification code qualifier) is missing.",
                suggestion: "Add N103 (Identification Code Qualifier) or remove the N1 segment if not required.",
              },
            ]
          : []

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${
              transaction.status === "completed" ? "bg-green-500" :
              transaction.status === "error" ? "bg-red-500" : "bg-blue-500"
            }`} />
            <div>
              <h2 className="text-xl font-bold text-foreground">{transaction.id}</h2>
              <p className="text-sm text-muted-foreground">
                {transaction.type} - {transaction.partner} - {transaction.direction.toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            X
          </button>
        </div>

        {/* Metadata Bar */}
        <div className="px-6 py-4 bg-secondary/30 border-b border-border grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Date & Time</p>
            <p className="font-medium text-foreground">
              {transaction.date} {transaction.time}
            </p>
          </div>
          <div>
            <p className="text-muted-foreground">Size</p>
            <p className="font-medium text-foreground">{transaction.size}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Records</p>
            <p className="font-medium text-foreground">{transaction.records}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Status</p>
            <p className={`font-medium capitalize ${
              transaction.status === "completed" ? "text-green-600" :
              transaction.status === "error" ? "text-red-600" : "text-blue-600"
            }`}>{transaction.status}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Errors</p>
            <p className={`font-medium ${errors.length > 0 ? "text-red-600" : "text-green-600"}`}>
              {errors.filter(e => e.severity === "error").length} error(s), {errors.filter(e => e.severity === "warning").length} warning(s)
            </p>
          </div>
        </div>

        {transaction.businessRefs && Object.keys(transaction.businessRefs).length > 0 && (
          <div className="px-6 py-3 border-b border-border text-xs text-muted-foreground flex gap-4 flex-wrap">
            {Object.entries(transaction.businessRefs).map(([k, v]) => (
              <span key={k}>
                <span className="font-semibold text-foreground">{k}</span>: {String(v)}
              </span>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-0 border-b border-border px-6 bg-card">
          {(["raw", "errors", "logs"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-medium text-sm border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? "text-primary border-primary"
                  : "text-muted-foreground border-transparent hover:text-foreground"
              }`}
            >
              {tab === "raw" ? "Raw X12" : tab === "errors" ? `Errors (${errors.length})` : "Logs"}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6 grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
          <div>
          {/* Raw X12 Tab */}
          {activeTab === "raw" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Raw EDI X12 Format</h3>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => copyToClipboard(transaction.raw)}
                >
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
              <pre className="p-4 bg-secondary/50 rounded-lg overflow-auto max-h-96 text-xs font-mono text-foreground border border-border whitespace-pre-wrap">
                {transaction.raw}
              </pre>
            </div>
          )}

          {/* Errors Tab */}
          {activeTab === "errors" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">Validation Errors & Warnings</h3>
                {errors.length > 0 && (
                  <div className="flex gap-4 text-sm">
                    <span className="text-red-600 font-medium">
                      {errors.filter(e => e.severity === "error").length} Error(s)
                    </span>
                    <span className="text-amber-600 font-medium">
                      {errors.filter(e => e.severity === "warning").length} Warning(s)
                    </span>
                  </div>
                )}
              </div>
              
              {errors.length > 0 ? (
                <div className="space-y-3">
                  {errors.map((error, idx) => (
                    <Card 
                      key={idx} 
                      className={`p-4 border-l-4 ${
                        error.severity === "error" 
                          ? "border-l-red-500 bg-red-50/50" 
                          : "border-l-amber-500 bg-amber-50/50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            error.severity === "error" 
                              ? "bg-red-100 text-red-700" 
                              : "bg-amber-100 text-amber-700"
                          }`}>
                            {error.severity.toUpperCase()}
                          </span>
                          <span className="font-mono text-sm font-semibold text-foreground">
                            {error.code}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                          Segment: {error.segment} | Position: {error.position}
                        </span>
                      </div>
                      <p className="font-medium text-foreground mb-2">{error.message}</p>
                      <p className="text-sm text-muted-foreground">{error.details}</p>
                      {error.suggestion && (
                        <p className="text-sm text-primary mt-2 pt-2 border-t border-border">
                          <span className="font-medium">Suggestion: </span>{error.suggestion}
                        </p>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-green-50/50 rounded-lg border border-green-200">
                  <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                    <span className="text-green-600 text-xl font-bold">OK</span>
                  </div>
                  <p className="font-semibold text-green-700">No Errors Found</p>
                  <p className="text-sm text-green-600 mt-1">
                    This transaction passed all validation checks successfully.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === "logs" && (
            <div className="space-y-2">
              <h3 className="font-semibold text-foreground mb-4">Processing Logs</h3>
              {transaction.logs.map((log: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg text-xs font-mono ${
                    log.level === "error"
                      ? "bg-red-50 text-red-700 border border-red-200"
                      : log.level === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : log.level === "warning"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-secondary/50 text-foreground border border-border"
                  }`}
                >
                  <div className="flex gap-2">
                    <span className="text-muted-foreground min-w-fit">[{log.timestamp}]</span>
                    <span className="font-semibold uppercase">[{log.level}]</span>
                    <span>{log.message}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>

          <Card className="p-4 h-fit">
            <h4 className="font-semibold text-foreground mb-3">Related Documents</h4>
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground uppercase">Upstream</p>
              {related.upstream.length === 0 && <p className="text-xs text-muted-foreground">No upstream linked</p>}
              {related.upstream.map((r) => (
                <button
                  key={`u-${r.transactionId}`}
                  className="w-full text-left p-2 rounded border border-border hover:bg-secondary/40"
                  onClick={() => onOpenTransaction?.(r.transactionId)}
                >
                  <p className="text-sm font-mono text-foreground">{r.transactionId}</p>
                  <p className="text-xs text-muted-foreground">{r.docType} · {r.relationType} · {r.partner}</p>
                </button>
              ))}
            </div>
            <div className="space-y-2 mt-4">
              <p className="text-xs text-muted-foreground uppercase">Downstream</p>
              {related.downstream.length === 0 && <p className="text-xs text-muted-foreground">No downstream linked</p>}
              {related.downstream.map((r) => (
                <button
                  key={`d-${r.transactionId}`}
                  className="w-full text-left p-2 rounded border border-border hover:bg-secondary/40"
                  onClick={() => onOpenTransaction?.(r.transactionId)}
                >
                  <p className="text-sm font-mono text-foreground">{r.transactionId}</p>
                  <p className="text-xs text-muted-foreground">{r.docType} · {r.relationType} · {r.partner}</p>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Footer */}
        <div className="flex gap-2 border-t border-border p-6 bg-card">
          <Button
            className="flex-1 gap-2 bg-primary hover:bg-primary/90"
            onClick={() => {
              const content = `Transaction: ${transaction.id}\nType: ${transaction.type} - ${transaction.typeName}\nPartner: ${transaction.partner}\nDirection: ${transaction.direction}\nStatus: ${transaction.status}\nDate: ${transaction.date} ${transaction.time}\n\n--- Raw EDI X12 ---\n${transaction.raw ?? ""}`
              downloadText(`transaction_${transaction.id}.edi`, content)
            }}
          >
            Export Transaction
          </Button>
          <Button variant="outline" className="flex-1 bg-transparent" onClick={onClose}>
            Close
          </Button>
        </div>
      </Card>
    </div>
  )
}
