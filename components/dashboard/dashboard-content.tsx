"use client"

import OverviewTab from "./tabs/overview-tab"
import CertificatesTab from "./tabs/certificates-tab"
import TransactionsTab from "./tabs/transactions-tab"
import PartnersTab from "./tabs/partners-tab"
import NotificationsTab from "./tabs/notifications-tab"
import SpecificationsTab from "./tabs/specifications-tab"

interface DashboardContentProps {
  activeTab: string
  onNavigate?: (tab: string) => void
}

export default function DashboardContent({ activeTab, onNavigate }: DashboardContentProps) {
  return (
    <div className="max-w-7xl mx-auto">
      {activeTab === "overview" && <OverviewTab onNavigate={onNavigate} />}
      {activeTab === "partners" && <PartnersTab />}
      {activeTab === "certificates" && <CertificatesTab />}
      {activeTab === "specifications" && <SpecificationsTab />}
      {activeTab === "transactions" && <TransactionsTab />}
      {activeTab === "notifications" && <NotificationsTab />}
    </div>
  )
}
