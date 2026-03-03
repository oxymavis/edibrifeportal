"use client"

import { useState, useMemo, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TransactionDetailModal from "../modals/transaction-detail-modal"
import { apiClient } from "@/lib/api-client"
import { downloadCsv } from "@/lib/utils"

export default function TransactionsTab() {
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production")
  const [transactions, setTransactions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTransactions = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await apiClient.getTransactions({ environment })
    if (res.success && Array.isArray(res.data)) {
      setTransactions(res.data)
    } else {
      setError(res.error ?? "Failed to load transactions")
      setTransactions([])
    }
    setLoading(false)
  }, [environment])

  useEffect(() => {
    fetchTransactions()
  }, [fetchTransactions])

  const [selectedTrx, setSelectedTrx] = useState<any>(null)
  
  // Filter states
  const [searchKeyword, setSearchKeyword] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedDirection, setSelectedDirection] = useState<string>("all")
  const [selectedPartner, setSelectedPartner] = useState<string>("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  const docTypes = [
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
    { code: "997", name: "Functional Ack" },
  ]
  const statusOptions = ["completed", "processing", "error", "pending"]
  const directionOptions = ["inbound", "outbound"]
  
  // Get unique partners
  const partners = useMemo(() => {
    const uniquePartners = [...new Set(transactions.map(t => t.partner))]
    return uniquePartners.sort()
  }, [transactions])

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(trx => {
      // Keyword search
      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase()
        const matchesKeyword = 
          trx.id.toLowerCase().includes(keyword) ||
          trx.partner.toLowerCase().includes(keyword) ||
          trx.controlNumber.toLowerCase().includes(keyword) ||
          trx.senderId.toLowerCase().includes(keyword) ||
          trx.receiverId.toLowerCase().includes(keyword) ||
          (trx.typeName && trx.typeName.toLowerCase().includes(keyword))
        if (!matchesKeyword) return false
      }
      
      // Document type filter
      if (selectedType !== "all" && trx.type !== selectedType) return false
      
      // Status filter
      if (selectedStatus !== "all" && trx.status !== selectedStatus) return false
      
      // Direction filter
      if (selectedDirection !== "all" && trx.direction !== selectedDirection) return false
      
      // Partner filter
      if (selectedPartner !== "all" && trx.partner !== selectedPartner) return false
      
      // Date range filter
      if (dateFrom && trx.date < dateFrom) return false
      if (dateTo && trx.date > dateTo) return false
      
      return true
    })
  }, [transactions, searchKeyword, selectedType, selectedStatus, selectedDirection, selectedPartner, dateFrom, dateTo])

  const clearFilters = () => {
    setSearchKeyword("")
    setSelectedType("all")
    setSelectedStatus("all")
    setSelectedDirection("all")
    setSelectedPartner("all")
    setDateFrom("")
    setDateTo("")
  }

  const hasActiveFilters = searchKeyword || selectedType !== "all" || selectedStatus !== "all" || 
    selectedDirection !== "all" || selectedPartner !== "all" || dateFrom || dateTo

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-50 text-green-700"
      case "processing":
        return "bg-blue-50 text-blue-700"
      case "error":
        return "bg-red-50 text-red-700"
      case "pending":
        return "bg-amber-50 text-amber-700"
      default:
        return "bg-gray-50 text-gray-700"
    }
  }

  const getDirectionBadge = (direction: string) => {
    return direction === "inbound" 
      ? "bg-cyan-50 text-cyan-700" 
      : "bg-purple-50 text-purple-700"
  }

  // Get doc type name
  const getDocTypeName = (code: string) => {
    const docType = docTypes.find(d => d.code === code)
    return docType ? docType.name : code
  }

  // Export to Excel function - CSV with proper escaping so Excel opens without corruption
  const escapeCsv = (v: unknown) => {
    const s = String(v ?? "")
    if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) return `"${s.replace(/"/g, '""')}"`
    return `"${s}"`
  }
  const exportToExcel = () => {
    const headers = ["Transaction ID", "Document Type", "Type Name", "Partner", "Direction", "Status", "Date", "Time", "Size", "Records", "Control Number", "Sender ID", "Receiver ID"]
    const rows = filteredTransactions.map(trx =>
      [trx.id, trx.type, trx.typeName, trx.partner, trx.direction, trx.status, trx.date, trx.time, trx.size, trx.records, trx.controlNumber, trx.senderId, trx.receiverId].map(escapeCsv).join(",")
    )
    const csvContent = [headers.map(h => escapeCsv(h)).join(","), ...rows].join("\r\n")
    downloadCsv(`transactions_${environment}_${new Date().toISOString().split("T")[0]}.csv`, csvContent)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Transactions</h2>
          <p className="text-muted-foreground">View and manage EDI document transactions</p>
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
          <Button 
            variant="outline" 
            className="gap-2 bg-transparent"
            onClick={exportToExcel}
          >
            Export Excel
          </Button>
        </div>
      </div>

      {loading && (
        <div className="py-8 text-center text-muted-foreground">Loading transactions...</div>
      )}
      {error && !loading && (
        <div className="py-4 px-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20 flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => fetchTransactions()}>Retry</Button>
        </div>
      )}

      {/* Environment Indicator */}
      {!loading && !error && (
      <>
      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
        environment === "production" 
          ? "bg-green-50 text-green-700 border border-green-200" 
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}>
        Currently viewing: <span className="font-bold uppercase">{environment}</span> transactions
        <span className="ml-4 text-xs">({filteredTransactions.length} of {transactions.length} shown)</span>
      </div>

      {/* Search and Quick Filters */}
      <Card className="p-4">
        <div className="space-y-4">
          {/* First Row: Search and Quick Actions */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by Transaction ID, Partner, Control Number, Sender/Receiver ID..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="bg-transparent"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                {showAdvancedFilters ? "Hide Filters" : "Advanced Filters"}
              </Button>
              {hasActiveFilters && (
                <Button variant="outline" className="bg-transparent" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </div>
          </div>

          {/* Document Type Quick Filter */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                selectedType === "all"
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-primary/10"
              }`}
            >
              All Types
            </button>
            {docTypes.map((type) => (
              <button
                key={type.code}
                onClick={() => setSelectedType(selectedType === type.code ? "all" : type.code)}
                className={`px-3 py-1.5 rounded-lg font-medium transition-colors text-xs ${
                  selectedType === type.code
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-primary/10"
                }`}
                title={type.name}
              >
                {type.code}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-border">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Status</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      {statusOptions.map(status => (
                        <SelectItem key={status} value={status} className="capitalize">
                          {status}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Direction */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Direction</Label>
                  <Select value={selectedDirection} onValueChange={setSelectedDirection}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Directions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Directions</SelectItem>
                      {directionOptions.map(dir => (
                        <SelectItem key={dir} value={dir} className="capitalize">
                          {dir}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Partner */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Trading Partner</Label>
                  <Select value={selectedPartner} onValueChange={setSelectedPartner}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Partners" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Partners</SelectItem>
                      {partners.map(partner => (
                        <SelectItem key={partner} value={partner}>
                          {partner}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Date From */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date From</Label>
                  <Input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                  />
                </div>

                {/* Date To */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date To</Label>
                  <Input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      {/* Transactions List */}
      <div className="space-y-3">
        {filteredTransactions.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No transactions found matching your criteria</p>
            {hasActiveFilters && (
              <Button 
                variant="link" 
                className="mt-2"
                onClick={clearFilters}
              >
                Clear filters to see all transactions
              </Button>
            )}
          </Card>
        ) : (
          filteredTransactions.map((trx) => (
            <Card
              key={trx.id}
              className="p-6 cursor-pointer border border-border hover:border-primary/50 hover:shadow-md transition-all"
              onClick={() => setSelectedTrx(trx)}
            >
              <div className="flex items-center justify-between">
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4 flex-1">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Transaction ID</p>
                    <p className="font-mono font-semibold text-foreground">{trx.id}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Document Type</p>
                    <p className="font-bold text-primary">{trx.type}</p>
                    <p className="text-xs text-muted-foreground">{getDocTypeName(trx.type)}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Trading Partner</p>
                    <p className="font-medium text-foreground text-sm">{trx.partner}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Direction</p>
                    <span className={`px-2 py-1 rounded text-xs font-semibold capitalize ${getDirectionBadge(trx.direction)}`}>
                      {trx.direction}
                    </span>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Size / Records</p>
                    <p className="font-medium text-foreground text-sm">
                      {trx.size} / {trx.records}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground mb-1">Status</p>
                    <span className={`px-3 py-1 rounded text-xs font-semibold capitalize ${getStatusColor(trx.status)}`}>
                      {trx.status}
                    </span>
                  </div>
                </div>
                <span className="text-muted-foreground ml-4">→</span>
              </div>
              <div className="mt-3 text-xs text-muted-foreground flex gap-4 flex-wrap">
                <span>{trx.date} {trx.time}</span>
                <span>Control#: {trx.controlNumber}</span>
                <span>Sender: {trx.senderId}</span>
                <span>Receiver: {trx.receiverId}</span>
              </div>
            </Card>
          ))
        )}
      </div>
      </>
      )}

      {/* Transaction Detail Modal */}
      {selectedTrx && (
        <TransactionDetailModal
          transaction={selectedTrx}
          onClose={() => setSelectedTrx(null)}
          onOpenTransaction={async (id) => {
            const res = await apiClient.getTransaction(id)
            if (res.success && res.data) setSelectedTrx(res.data)
          }}
        />
      )}
    </div>
  )
}
