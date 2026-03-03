"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"

interface OverviewTabProps {
  onNavigate?: (tab: string) => void
}

export default function OverviewTab({ onNavigate }: OverviewTabProps) {
  const [environment, setEnvironment] = useState<"production" | "sandbox">("production")
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [certificates, setCertificates] = useState<any[]>([])
  const [partners, setPartners] = useState<any[]>([])
  const [transactions, setTransactions] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError(null)
    const [certRes, partnerRes, trxRes, notifRes] = await Promise.all([
      apiClient.getCertificates({ environment }),
      apiClient.getPartners(environment),
      apiClient.getTransactions({ environment }),
      apiClient.getNotifications({ environment }),
    ])

    if (!certRes.success || !partnerRes.success || !trxRes.success || !notifRes.success) {
      setError("Failed to load overview data")
      setLoading(false)
      return
    }

    setCertificates(Array.isArray(certRes.data) ? certRes.data : [])
    setPartners(Array.isArray(partnerRes.data) ? partnerRes.data : [])
    setTransactions(Array.isArray(trxRes.data) ? trxRes.data : [])
    setNotifications(Array.isArray(notifRes.data) ? notifRes.data : [])
    setLoading(false)
  }, [environment])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const stats = useMemo(
    () => [
      { title: "Active Certificates", value: String(certificates.filter((c) => c.status === "active").length), link: "certificates" },
      { title: "Trading Partners", value: String(partners.length), link: "partners" },
      { title: "Recent Transactions", value: String(transactions.length), link: "transactions" },
      { title: "Pending Actions", value: String(notifications.filter((n) => !n.read && !n.archived).length), link: "notifications" },
    ],
    [certificates, partners, transactions, notifications]
  )

  const recentCerts = useMemo(() => certificates.slice(0, 5), [certificates])

  const recentActivity = useMemo(() => {
    return transactions.slice(0, 6).map((t) => ({
      partner: t.partner,
      partnerCode: (t.partner || "").slice(0, 4).toUpperCase(),
      action: `${t.type} ${t.typeName || "Document"} ${t.status}`,
      time: `${t.date} ${t.time}`,
      status: t.status,
    }))
  }, [transactions])

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-2">Welcome back</h2>
          <p className="text-muted-foreground">Here's your activity overview</p>
        </div>
        <div className="flex items-center gap-2 bg-secondary rounded-lg p-1">
          <button
            onClick={() => setEnvironment("production")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              environment === "production" ? "bg-green-600 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Production
          </button>
          <button
            onClick={() => setEnvironment("sandbox")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              environment === "sandbox" ? "bg-amber-500 text-white" : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sandbox
          </button>
        </div>
      </div>

      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${environment === "production" ? "bg-green-50 text-green-700 border border-green-200" : "bg-amber-50 text-amber-700 border border-amber-200"}`}>
        Currently viewing: <span className="font-bold uppercase">{environment}</span> environment
      </div>

      {loading && <div className="py-8 text-center text-muted-foreground">Loading overview...</div>}
      {error && !loading && <Card className="p-4 text-destructive bg-destructive/10 border-destructive/20">{error}</Card>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat) => (
              <Card key={stat.title} className="p-6 cursor-pointer hover:border-primary/50 hover:shadow-md transition-all" onClick={() => onNavigate?.(stat.link)}>
                <p className="text-sm font-medium text-muted-foreground mb-2">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-primary mt-2">View details</p>
              </Card>
            ))}
          </div>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-foreground">Certificates</h3>
              <Button variant="outline" size="sm" className="bg-transparent" onClick={() => onNavigate?.("certificates")}>Manage Certificates</Button>
            </div>
            <div className="space-y-3">
              {recentCerts.length === 0 && <p className="text-sm text-muted-foreground">No certificates found.</p>}
              {recentCerts.map((cert) => (
                <div key={cert.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium text-foreground">{cert.name}</p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-semibold">{cert.partner}</span> - {cert.usage} - Expires {cert.expires}
                    </p>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${cert.status === "active" ? "bg-green-50 text-green-700" : cert.status === "expiring" ? "bg-amber-50 text-amber-700" : "bg-gray-100 text-gray-700"}`}>
                    {cert.status}
                  </span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4">Recent Partner Activity</h3>
            <div className="space-y-3">
              {recentActivity.length === 0 && <p className="text-sm text-muted-foreground">No recent transactions.</p>}
              {recentActivity.map((activity, idx) => (
                <div key={`${activity.partner}-${idx}`} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{activity.partnerCode.slice(0, 2)}</span>
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        <span className="text-primary">{activity.partner}</span>
                        <span className="text-muted-foreground ml-2 text-xs font-mono">({activity.partnerCode})</span>
                      </p>
                      <p className="text-sm text-muted-foreground">{activity.action}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </Card>
        </>
      )}
    </div>
  )
}
