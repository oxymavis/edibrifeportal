interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  code?: string
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ""

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null
  const row = document.cookie
    .split("; ")
    .find((r) => r.startsWith(`${name}=`))
  return row ? decodeURIComponent(row.split("=")[1]) : null
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResponse<T>> {
  try {
    const method = (init?.method || "GET").toUpperCase()
    const isMutation = !["GET", "HEAD", "OPTIONS"].includes(method)
    const csrfToken = isMutation ? getCookie("edi_csrf") : null
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...(csrfToken ? { "x-csrf-token": csrfToken } : {}),
        ...(init?.headers || {}),
      },
    })

    const data = await response.json()
    return data
  } catch {
    return { success: false, error: "Network request failed" }
  }
}

export const apiClient = {
  // Auth
  async register(payload: {
    name: string
    email: string
    password: string
    confirmPassword?: string
    rememberMe?: boolean
  }) {
    return request<{ user: any }>("/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async login(payload: { email: string; password: string; rememberMe?: boolean }) {
    return request<{ user: any }>("/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async logout() {
    return request<{ loggedOut: boolean }>("/v1/auth/logout", { method: "POST", body: "{}" })
  },

  async me() {
    return request<{ user: any }>("/v1/auth/me")
  },

  // Certificates API
  async getCertificates(filters?: {
    environment?: "production" | "sandbox"
    status?: string
    partner?: string
    search?: string
    expiry?: "30" | "60" | "90"
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (filters?.environment) params.set("environment", filters.environment)
    if (filters?.status) params.set("status", filters.status)
    if (filters?.partner) params.set("partner", filters.partner)
    if (filters?.search) params.set("search", filters.search)
    if (filters?.expiry) params.set("expiry", filters.expiry)
    const qs = params.toString()
    return request<any[]>(`/v1/certificates${qs ? `?${qs}` : ""}`)
  },

  async uploadCertificate(
    file: File | null,
    name: string,
    usage: string,
    partner: string,
    env: "production" | "sandbox" = "production",
    type?: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData()
    if (file) formData.append("file", file)
    formData.append("name", name)
    formData.append("usage", usage)
    formData.append("partner", partner)
    formData.append("environment", env)
    if (type) formData.append("type", type)

    return request<any>("/v1/certificates", {
      method: "POST",
      body: formData,
    })
  },

  async deleteCertificate(id: number): Promise<ApiResponse<void>> {
    return request<void>(`/v1/certificates/${id}`, {
      method: "DELETE",
    })
  },

  async updateCertificate(id: number, payload: Record<string, any>): Promise<ApiResponse<any>> {
    return request<any>(`/v1/certificates/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  // Transactions API
  async getTransactions(filters?: {
    environment?: "production" | "sandbox"
    type?: string
    status?: string
    direction?: string
    partner?: string
    dateFrom?: string
    dateTo?: string
    search?: string
    relatedDocType?: string
    relatedRef?: string
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (filters?.environment) params.set("environment", filters.environment)
    if (filters?.type) params.set("type", filters.type)
    if (filters?.status) params.set("status", filters.status)
    if (filters?.direction) params.set("direction", filters.direction)
    if (filters?.partner) params.set("partner", filters.partner)
    if (filters?.dateFrom) params.set("dateFrom", filters.dateFrom)
    if (filters?.dateTo) params.set("dateTo", filters.dateTo)
    if (filters?.search) params.set("search", filters.search)
    if (filters?.relatedDocType) params.set("relatedDocType", filters.relatedDocType)
    if (filters?.relatedRef) params.set("relatedRef", filters.relatedRef)
    const qs = params.toString()
    return request<any[]>(`/v1/transactions${qs ? `?${qs}` : ""}`)
  },

  async getTransaction(id: string): Promise<ApiResponse<any>> {
    return request<any>(`/v1/transactions/${id}`)
  },

  async getTransactionRelated(id: string): Promise<ApiResponse<{ upstream: any[]; downstream: any[] }>> {
    return request<{ upstream: any[]; downstream: any[] }>(`/v1/transactions/${id}/related`)
  },

  async uploadEdiDocument(
    file: File,
    documentType: string,
    environment: "production" | "sandbox" = "production",
    partner?: string
  ): Promise<ApiResponse<any>> {
    const formData = new FormData()
    formData.append("file", file)
    formData.append("type", documentType)
    formData.append("environment", environment)
    if (partner) formData.append("partner", partner)

    return request<any>("/v1/transactions", {
      method: "POST",
      body: formData,
    })
  },

  // Trading Partners API
  async getPartners(environment?: "production" | "sandbox"): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (environment) params.set("environment", environment)
    const qs = params.toString()
    return request<any[]>(`/v1/partners${qs ? `?${qs}` : ""}`)
  },

  async getPartner(id: string): Promise<ApiResponse<any>> {
    return request<any>(`/v1/partners/${id}`)
  },

  async createPartner(partnerData: any): Promise<ApiResponse<any>> {
    return request<any>("/v1/partners", {
      method: "POST",
      body: JSON.stringify(partnerData),
    })
  },

  async updatePartner(id: string, partnerData: any): Promise<ApiResponse<any>> {
    return request<any>(`/v1/partners/${id}`, {
      method: "PUT",
      body: JSON.stringify(partnerData),
    })
  },

  async deletePartner(id: string): Promise<ApiResponse<void>> {
    return request<void>(`/v1/partners/${id}`, {
      method: "DELETE",
    })
  },

  async getSubsidiaryRouting(partnerId: string, subsidiaryId: string): Promise<ApiResponse<any>> {
    return request<any>(`/v1/partners/${partnerId}/subsidiaries/${subsidiaryId}/routing`)
  },

  async updateSubsidiaryRouting(
    partnerId: string,
    subsidiaryId: string,
    payload: { enabledTypes: any[]; rules: any[] }
  ): Promise<ApiResponse<any>> {
    return request<any>(`/v1/partners/${partnerId}/subsidiaries/${subsidiaryId}/routing`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  // Notifications API
  async getNotifications(filters?: {
    environment?: "production" | "sandbox"
    type?: string
    showArchived?: boolean
  }): Promise<ApiResponse<any[]>> {
    const params = new URLSearchParams()
    if (filters?.environment) params.set("environment", filters.environment)
    if (filters?.type) params.set("type", filters.type)
    if (filters?.showArchived) params.set("showArchived", "true")
    const qs = params.toString()
    return request<any[]>(`/v1/notifications${qs ? `?${qs}` : ""}`)
  },

  async markNotificationAsRead(id: number): Promise<ApiResponse<void>> {
    return request<void>(`/v1/notifications/${id}/read`, {
      method: "PUT",
      body: "{}",
    })
  },

  async markAllNotificationsRead(environment?: "production" | "sandbox"): Promise<ApiResponse<{ updated: number }>> {
    return request<{ updated: number }>("/v1/notifications/mark-all-read", {
      method: "PUT",
      body: JSON.stringify(environment ? { environment } : {}),
    })
  },

  async updateNotification(id: number, data: { read?: boolean; archived?: boolean }): Promise<ApiResponse<any>> {
    return request<any>(`/v1/notifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    })
  },

  // Specifications API
  async getSpecifications(filters?: {
    section?: "all" | "unis" | "tp"
    category?: string
    partner?: string
    partnerCode?: string
    messageType?: string
    search?: string
  }): Promise<ApiResponse<any>> {
    const params = new URLSearchParams()
    if (filters?.section) params.set("section", filters.section)
    if (filters?.category) params.set("category", filters.category)
    if (filters?.partner) params.set("partner", filters.partner)
    if (filters?.partnerCode) params.set("partnerCode", filters.partnerCode)
    if (filters?.messageType) params.set("messageType", filters.messageType)
    if (filters?.search) params.set("search", filters.search)
    const qs = params.toString()
    return request<any>(`/v1/specifications${qs ? `?${qs}` : ""}`)
  },

  async createSpecification(payload: any): Promise<ApiResponse<any>> {
    return request<any>("/v1/specifications", {
      method: "POST",
      body: JSON.stringify(payload),
    })
  },

  async uploadSpecificationFile(payload: {
    messageType: string
    messageName?: string
    partner: string
    partnerCode: string
    version: string
    uploadedBy?: string
    file: File
  }): Promise<ApiResponse<any>> {
    const form = new FormData()
    form.append("messageType", payload.messageType)
    if (payload.messageName) form.append("messageName", payload.messageName)
    form.append("partner", payload.partner)
    form.append("partnerCode", payload.partnerCode)
    form.append("version", payload.version)
    if (payload.uploadedBy) form.append("uploadedBy", payload.uploadedBy)
    form.append("file", payload.file)
    return request<any>("/v1/specifications/upload", {
      method: "POST",
      body: form,
    })
  },

  async updateSpecification(id: string, payload: { status?: "active" | "inactive" }): Promise<ApiResponse<any>> {
    return request<any>(`/v1/specifications/${id}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    })
  },

  certificateDownloadUrl(id: number): string {
    return `${API_BASE}/v1/certificates/${id}/download`
  },

  specificationDownloadUrl(id: string): string {
    return `${API_BASE}/v1/specifications/${id}/download`
  },
}
