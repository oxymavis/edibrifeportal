"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import DashboardLayout from "@/components/dashboard/dashboard-layout"
import { apiClient } from "@/lib/api-client"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    let active = true
    apiClient.me().then((res) => {
      if (!active) return
      if (!res.success || !res.data?.user) {
        router.push("/")
        return
      }
      setUser(res.data.user)
    })
    return () => {
      active = false
    }
  }, [router])

  if (!user) return null

  return <DashboardLayout user={user} />
}
