"use client"

export default function SidebarNav({
  activeTab,
  setActiveTab,
}: {
  activeTab: string
  setActiveTab: (tab: string) => void
}) {
  const navItems = [
    { id: "overview", label: "Overview" },
    { id: "partners", label: "Trading Partners" },
    { id: "certificates", label: "Certificates" },
    { id: "specifications", label: "Message Specifications" },
    { id: "transactions", label: "Transactions" },
    { id: "notifications", label: "Notifications" },
  ]

  return (
    <nav className="flex-1 px-4 py-6 space-y-2">
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => setActiveTab(item.id)}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
            activeTab === item.id
              ? "bg-primary/10 text-primary"
              : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
          }`}
        >
          <span className="font-medium">{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
