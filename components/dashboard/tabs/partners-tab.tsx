"use client"

import { useState, useEffect, useCallback } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import PartnerDetailModal from "../modals/partner-detail-modal"
import AddPartnerModal from "../modals/add-partner-modal"
import { apiClient } from "@/lib/api-client"

// Hierarchical Partner Structure
interface AS2Profile {
  id: string
  name: string
  as2Id: string
  url: string
  encryptionCert?: string
  signingCert?: string
  status: "active" | "inactive"
}

interface Subsidiary {
  id: string
  name: string
  code: string
  region: string
  as2Profiles: AS2Profile[]
  documentTypes: string[]
  status: "active" | "inactive"
}

interface TradingPartner {
  id: string
  name: string
  code: string
  type: "platform" | "retailer" | "van" | "3pl" | "manufacturer"
  tier: "enterprise" | "standard" | "basic"
  email: string
  status: "active" | "inactive"
  subsidiaries: Subsidiary[]
  as2Profiles: AS2Profile[]
  documentTypes: string[]
  lastSync: string
  transactionCount: number
}

/** Map API partner (primaryContact, supportedDocTypes) to UI shape (email, documentTypes). */
function mapApiPartnerToUI(p: any): TradingPartner {
  const subs = (p.subsidiaries ?? []).map((s: any) => ({
    id: s.id,
    name: s.name,
    code: s.code,
    region: s.region ?? "N/A",
    status: s.status,
    as2Profiles: (s.as2Profiles ?? []).map((a: any) => ({
      id: a.id,
      name: a.name,
      as2Id: a.as2Id,
      url: a.as2Url ?? a.url,
      encryptionCert: a.encryptionCert,
      signingCert: a.signingCert,
      status: a.status,
    })),
    documentTypes: s.supportedDocTypes?.x12 ?? s.documentTypes ?? [],
  }))
  const directDocTypes = p.documentTypes ?? (subs[0]?.documentTypes ?? [])
  return {
    id: p.id,
    name: p.name,
    code: p.code,
    type: p.type ?? "retailer",
    tier: p.tier ?? "standard",
    email: p.primaryContact?.email ?? "",
    status: p.status ?? "active",
    subsidiaries: subs,
    as2Profiles: p.as2Profiles ?? [],
    documentTypes: directDocTypes,
    lastSync: p.lastSync ?? "-",
    transactionCount: p.transactionCount ?? 0,
  }
}

export default function PartnersTab() {
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production")
  const [showAddModal, setShowAddModal] = useState(false)
  const [partners, setPartners] = useState<TradingPartner[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchPartners = useCallback(async () => {
    setLoading(true)
    setError(null)
    const res = await apiClient.getPartners(environment)
    if (res.success && Array.isArray(res.data)) {
      setPartners(res.data.map(mapApiPartnerToUI))
    } else {
      setError(res.error ?? "Failed to load partners")
      setPartners([])
    }
    setLoading(false)
  }, [environment])

  useEffect(() => {
    fetchPartners()
  }, [fetchPartners])

  const [selectedPartner, setSelectedPartner] = useState<TradingPartner | null>(null)
  const [selectedSubsidiary, setSelectedSubsidiary] = useState<Subsidiary | null>(null)
  const [expandedPartners, setExpandedPartners] = useState<Set<string>>(new Set())
  const [searchQuery, setSearchQuery] = useState("")
  const [filterType, setFilterType] = useState<string>("all")

  const toggleExpanded = (partnerId: string) => {
    const newExpanded = new Set(expandedPartners)
    if (newExpanded.has(partnerId)) {
      newExpanded.delete(partnerId)
    } else {
      newExpanded.add(partnerId)
    }
    setExpandedPartners(newExpanded)
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      platform: "Platform",
      retailer: "Retailer",
      van: "VAN Provider",
      "3pl": "3PL",
      manufacturer: "Manufacturer"
    }
    return labels[type] || type
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      platform: "bg-purple-100 text-purple-700",
      retailer: "bg-blue-100 text-blue-700",
      van: "bg-green-100 text-green-700",
      "3pl": "bg-orange-100 text-orange-700",
      manufacturer: "bg-gray-100 text-gray-700"
    }
    return colors[type] || "bg-gray-100 text-gray-700"
  }

  const getTierColor = (tier: string) => {
    const colors: Record<string, string> = {
      enterprise: "bg-amber-100 text-amber-700",
      standard: "bg-slate-100 text-slate-700",
      basic: "bg-zinc-100 text-zinc-700"
    }
    return colors[tier] || "bg-gray-100 text-gray-700"
  }

  const filteredPartners = partners.filter(partner => {
    const matchesSearch = partner.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      partner.subsidiaries.some(sub => 
        sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sub.code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    const matchesType = filterType === "all" || partner.type === filterType
    return matchesSearch && matchesType
  })

  const totalAS2Profiles = partners.reduce((acc, p) => {
    const directProfiles = p.as2Profiles.length
    const subProfiles = p.subsidiaries.reduce((sum, s) => sum + s.as2Profiles.length, 0)
    return acc + directProfiles + subProfiles
  }, 0)

  const totalSubsidiaries = partners.reduce((acc, p) => acc + p.subsidiaries.length, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Trading Partners</h2>
          <p className="text-muted-foreground">
            Manage hierarchical partner structures with multi-level AS2 configurations
          </p>
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
          <Button className="gap-2 bg-primary hover:bg-primary/90" onClick={() => setShowAddModal(true)}>+ Add Partner</Button>
        </div>
      </div>

      {/* Loading / Error */}
      {loading && (
        <div className="py-8 text-center text-muted-foreground">Loading partners...</div>
      )}
      {error && !loading && (
        <div className="py-4 px-4 rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
          {error}
          <Button variant="outline" size="sm" className="ml-2" onClick={() => fetchPartners()}>
            Retry
          </Button>
        </div>
      )}

      {/* Environment Indicator */}
      {!loading && (
      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${
        environment === "production" 
          ? "bg-green-50 text-green-700 border border-green-200" 
          : "bg-amber-50 text-amber-700 border border-amber-200"
      }`}>
        Currently viewing: <span className="font-bold uppercase">{environment}</span> trading partners
      </div>
      )}

      {/* Stats Summary, Search, List - only when not loading */}
      {!loading && !error && (
      <>
      <div className="grid grid-cols-4 gap-4">
        <Card className="p-4 border border-border">
          <p className="text-sm text-muted-foreground">Total Partners</p>
          <p className="text-2xl font-bold text-foreground">{partners.length}</p>
        </Card>
        <Card className="p-4 border border-border">
          <p className="text-sm text-muted-foreground">Subsidiaries</p>
          <p className="text-2xl font-bold text-foreground">{totalSubsidiaries}</p>
        </Card>
        <Card className="p-4 border border-border">
          <p className="text-sm text-muted-foreground">AS2 Profiles</p>
          <p className="text-2xl font-bold text-foreground">{totalAS2Profiles}</p>
        </Card>
        <Card className="p-4 border border-border">
          <p className="text-sm text-muted-foreground">Active Connections</p>
          <p className="text-2xl font-bold text-green-600">
            {partners.filter(p => p.status === "active").length}
          </p>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search partners, subsidiaries, or codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="bg-background"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-4 py-2 border border-border rounded-lg bg-background text-foreground"
        >
          <option value="all">All Types</option>
          <option value="platform">Platform</option>
          <option value="retailer">Retailer</option>
          <option value="van">VAN Provider</option>
          <option value="3pl">3PL</option>
          <option value="manufacturer">Manufacturer</option>
        </select>
      </div>

      {/* Partners Hierarchy List */}
      <div className="space-y-4">
        {filteredPartners.map((partner) => (
          <Card key={partner.id} className="border border-border overflow-hidden">
            {/* Partner Header (Parent Level) */}
            <div 
              className="p-4 bg-secondary/30 cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => toggleExpanded(partner.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <span className={`transform transition-transform ${expandedPartners.has(partner.id) ? "rotate-90" : ""}`}>
                    {partner.subsidiaries.length > 0 ? ">" : ""}
                  </span>
                  <div>
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-foreground">{partner.name}</h3>
                      <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-mono">
                        {partner.code}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTypeColor(partner.type)}`}>
                        {getTypeLabel(partner.type)}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${getTierColor(partner.tier)}`}>
                        {partner.tier}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{partner.email}</span>
                      <span>|</span>
                      <span>
                        {partner.subsidiaries.length > 0 
                          ? `${partner.subsidiaries.length} subsidiaries` 
                          : `${partner.as2Profiles.length} AS2 profile(s)`}
                      </span>
                      <span>|</span>
                      <span>{partner.transactionCount.toLocaleString()} transactions</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    partner.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                  }`}>
                    {partner.status}
                  </span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="bg-transparent"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedPartner(partner)
                      setSelectedSubsidiary(null)
                    }}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            </div>

            {/* Expanded Content - Subsidiaries */}
            {expandedPartners.has(partner.id) && partner.subsidiaries.length > 0 && (
              <div className="border-t border-border">
                {partner.subsidiaries.map((subsidiary, idx) => (
                  <div 
                    key={subsidiary.id}
                    className={`p-4 pl-12 ${idx < partner.subsidiaries.length - 1 ? "border-b border-border" : ""} hover:bg-secondary/20 transition-colors`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center text-primary text-xs font-bold">
                            S
                          </div>
                          <h4 className="font-semibold text-foreground">{subsidiary.name}</h4>
                          <span className="px-2 py-0.5 bg-secondary text-muted-foreground rounded text-xs font-mono">
                            {subsidiary.code}
                          </span>
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs">
                            {subsidiary.region}
                          </span>
                        </div>
                        
                        {/* AS2 Profiles */}
                        <div className="mt-3 ml-9 space-y-2">
                          <p className="text-xs text-muted-foreground font-medium">
                            AS2 Profiles ({subsidiary.as2Profiles.length})
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {subsidiary.as2Profiles.map((profile) => (
                              <div 
                                key={profile.id}
                                className={`px-3 py-2 rounded-lg border text-xs ${
                                  profile.status === "active" 
                                    ? "bg-green-50 border-green-200" 
                                    : "bg-gray-50 border-gray-200"
                                }`}
                              >
                                <div className="font-semibold text-foreground">{profile.name}</div>
                                <div className="font-mono text-muted-foreground">{profile.as2Id}</div>
                              </div>
                            ))}
                          </div>
                          
                          {/* Document Types */}
                          <div className="flex items-center gap-2 mt-2">
                            <span className="text-xs text-muted-foreground">Documents:</span>
                            <div className="flex gap-1 flex-wrap">
                              {subsidiary.documentTypes.map((doc) => (
                                <span 
                                  key={doc} 
                                  className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold"
                                >
                                  {doc}
                                </span>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          subsidiary.status === "active" ? "bg-green-50 text-green-700" : "bg-gray-50 text-gray-700"
                        }`}>
                          {subsidiary.status}
                        </span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="bg-transparent"
                          onClick={() => {
                            setSelectedPartner(partner)
                            setSelectedSubsidiary(subsidiary)
                          }}
                        >
                          Configure
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Add Subsidiary Button */}
                <div className="p-3 pl-12 bg-secondary/10 border-t border-border">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    + Add Subsidiary
                  </Button>
                </div>
              </div>
            )}

            {/* Direct AS2 Profiles (for partners without subsidiaries) */}
            {expandedPartners.has(partner.id) && partner.subsidiaries.length === 0 && partner.as2Profiles.length > 0 && (
              <div className="border-t border-border p-4 pl-12">
                <p className="text-sm text-muted-foreground font-medium mb-3">
                  AS2 Profiles ({partner.as2Profiles.length})
                </p>
                <div className="flex flex-wrap gap-3">
                  {partner.as2Profiles.map((profile) => (
                    <div 
                      key={profile.id}
                      className={`px-4 py-3 rounded-lg border ${
                        profile.status === "active" 
                          ? "bg-green-50 border-green-200" 
                          : "bg-gray-50 border-gray-200"
                      }`}
                    >
                      <div className="font-semibold text-foreground text-sm">{profile.name}</div>
                      <div className="font-mono text-xs text-muted-foreground mt-1">{profile.as2Id}</div>
                      <div className="text-xs text-muted-foreground mt-1 truncate max-w-xs">{profile.url}</div>
                    </div>
                  ))}
                </div>
                
                <div className="flex items-center gap-2 mt-4">
                  <span className="text-sm text-muted-foreground">Supported Documents:</span>
                  <div className="flex gap-1 flex-wrap">
                    {partner.documentTypes.map((doc) => (
                      <span 
                        key={doc} 
                        className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-semibold"
                      >
                        {doc}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="mt-4">
                  <Button variant="outline" size="sm" className="gap-2 bg-transparent">
                    + Add AS2 Profile
                  </Button>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>
      </>
      )}

      {/* Partner Detail Modal */}
      {selectedPartner && (
        <PartnerDetailModal 
          partner={selectedPartner} 
          subsidiary={selectedSubsidiary}
          onClose={() => {
            setSelectedPartner(null)
            setSelectedSubsidiary(null)
          }} 
        />
      )}

      {/* Add Partner Modal */}
      {showAddModal && (
        <AddPartnerModal
          onClose={() => setShowAddModal(false)}
          onSave={async (newPartner) => {
            const body: any = {
              name: newPartner.name,
              code: newPartner.code,
              industry: (newPartner as any).industry ?? "retail",
              website: (newPartner as any).website,
              primaryContact: {
                name: (newPartner as any).contactName ?? "",
                email: newPartner.email,
                phone: (newPartner as any).contactPhone,
              },
              status: "active",
              environment,
              subsidiaries: [],
            }
            if ((newPartner.as2Profiles ?? []).length > 0) {
              const ap = newPartner.as2Profiles[0]
              body.subsidiaries = [{
                name: `${newPartner.name} Primary`,
                code: `${newPartner.code}-PR`,
                region: "N/A",
                status: "active",
                as2Profiles: [{
                  name: ap.name,
                  as2Id: ap.as2Id,
                  as2Url: ap.url,
                  status: "active",
                  encryptionCert: ap.encryptionCert ?? null,
                  signingCert: ap.signingCert ?? null,
                  mdnRequired: true,
                  mdnSigned: true,
                  encryptionAlgorithm: (ap as any).encryptionAlgorithm ?? "AES-256",
                  signatureAlgorithm: (ap as any).signatureAlgorithm ?? "SHA-256",
                }],
                supportedDocTypes: { x12: newPartner.documentTypes ?? [], edifact: [] },
              }]
            }
            const res = await apiClient.createPartner(body)
            setShowAddModal(false)
            if (res.success && res.data) {
              setPartners(prev => [...prev, mapApiPartnerToUI(res.data)])
            } else {
              await fetchPartners()
            }
          }}
        />
      )}
    </div>
  )
}
