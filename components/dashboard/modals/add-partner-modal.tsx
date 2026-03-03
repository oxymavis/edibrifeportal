"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { EDI_DOCUMENT_TYPES, EDI_DOCUMENT_TYPE_CODES } from "@/lib/constants"

interface AddPartnerModalProps {
  onClose: () => void
  onSave: (partner: any) => void
}

export default function AddPartnerModal({ onClose, onSave }: AddPartnerModalProps) {
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    // Basic Info
    name: "",
    code: "",
    type: "retailer",
    tier: "standard",
    industry: "retail",
    website: "",
    contactName: "",
    email: "",
    contactPhone: "",
    // AS2 Profile
    as2Id: "",
    as2Url: "",
    encryptionAlgorithm: "AES-256",
    signatureAlgorithm: "SHA-256",
    encryptionCert: "",
    signingCert: "",
    mdnRequired: true,
    mdnSigned: true,
    // Document Types
    documentTypes: [] as string[],
  })

  const partnerTypes = [
    { value: "platform", label: "Platform" },
    { value: "retailer", label: "Retailer" },
    { value: "van", label: "VAN Provider" },
    { value: "3pl", label: "3PL" },
    { value: "manufacturer", label: "Manufacturer" },
  ]

  const tiers = [
    { value: "enterprise", label: "Enterprise" },
    { value: "standard", label: "Standard" },
    { value: "basic", label: "Basic" },
  ]

  const industries = [
    { value: "retail", label: "Retail" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "logistics", label: "Logistics" },
    { value: "healthcare", label: "Healthcare" },
    { value: "other", label: "Other" },
  ]

  const encryptionAlgorithms = [
    { value: "AES-128", label: "AES-128" },
    { value: "AES-256", label: "AES-256" },
    { value: "3DES", label: "3DES" },
  ]

  const signatureAlgorithms = [
    { value: "SHA-256", label: "SHA-256" },
    { value: "SHA-384", label: "SHA-384" },
    { value: "SHA-1", label: "SHA-1" },
  ]

  const documentTypeOptions = EDI_DOCUMENT_TYPE_CODES.map(code => ({
    value: code,
    label: `${code} - ${EDI_DOCUMENT_TYPES[code]}`,
  }))

  const toggleDocType = (docType: string) => {
    setFormData(prev => ({
      ...prev,
      documentTypes: prev.documentTypes.includes(docType)
        ? prev.documentTypes.filter(d => d !== docType)
        : [...prev.documentTypes, docType]
    }))
  }

  const handleSubmit = () => {
    const newPartner = {
      id: `tp-${Date.now()}`,
      name: formData.name,
      code: formData.code,
      type: formData.type,
      tier: formData.tier,
      industry: formData.industry,
      website: formData.website || undefined,
      contactName: formData.contactName || undefined,
      email: formData.email,
      contactPhone: formData.contactPhone || undefined,
      status: "active",
      subsidiaries: [],
      as2Profiles: formData.as2Id ? [{
        id: `as2-${Date.now()}`,
        name: `${formData.name} Primary`,
        as2Id: formData.as2Id,
        url: formData.as2Url,
        encryptionAlgorithm: formData.encryptionAlgorithm,
        signatureAlgorithm: formData.signatureAlgorithm,
        encryptionCert: formData.encryptionCert,
        signingCert: formData.signingCert,
        status: "active"
      }] : [],
      documentTypes: formData.documentTypes,
      lastSync: "-",
      transactionCount: 0
    }
    onSave(newPartner)
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border bg-card">
          <div>
            <h2 className="text-xl font-bold text-foreground">Add Trading Partner</h2>
            <p className="text-sm text-muted-foreground mt-1">Step {step} of 3</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-muted-foreground hover:text-foreground rounded-lg hover:bg-secondary transition-colors"
          >
            X
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1 rounded ${s <= step ? "bg-primary" : "bg-secondary"}`}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-muted-foreground">
            <span className={step >= 1 ? "text-primary font-medium" : ""}>Basic Info</span>
            <span className={step >= 2 ? "text-primary font-medium" : ""}>AS2 Configuration</span>
            <span className={step >= 3 ? "text-primary font-medium" : ""}>Document Types</span>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto p-6">
          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Partner Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Walmart, Target"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="code">Partner Code *</Label>
                  <Input
                    id="code"
                    placeholder="e.g., WMT, TGT"
                    value={formData.code}
                    onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                    className="font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Partner Type *</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {partnerTypes.map(pt => (
                      <option key={pt.value} value={pt.value}>{pt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tier">Service Tier *</Label>
                  <select
                    id="tier"
                    value={formData.tier}
                    onChange={(e) => setFormData(prev => ({ ...prev, tier: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {tiers.map(t => (
                      <option key={t.value} value={t.value}>{t.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry *</Label>
                <select
                  id="industry"
                  value={formData.industry}
                  onChange={(e) => setFormData(prev => ({ ...prev, industry: e.target.value }))}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                >
                  {industries.map(i => (
                    <option key={i.value} value={i.value}>{i.label}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  type="url"
                  placeholder="https://www.partner.com"
                  value={formData.website}
                  onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact Name</Label>
                  <Input
                    id="contactName"
                    placeholder="John Smith"
                    value={formData.contactName}
                    onChange={(e) => setFormData(prev => ({ ...prev, contactName: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Contact Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="edi@partner.com"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contactPhone">Contact Phone</Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={formData.contactPhone}
                  onChange={(e) => setFormData(prev => ({ ...prev, contactPhone: e.target.value }))}
                />
              </div>
            </div>
          )}

          {/* Step 2: AS2 Configuration */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  Configure the AS2 connection settings for secure EDI document exchange. 
                  You can add additional AS2 profiles later.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="as2Id">AS2 Identifier *</Label>
                  <Input
                    id="as2Id"
                    placeholder="e.g., PARTNER-AS2-PROD"
                    value={formData.as2Id}
                    onChange={(e) => setFormData(prev => ({ ...prev, as2Id: e.target.value }))}
                    className="font-mono"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="as2Url">AS2 Endpoint URL *</Label>
                  <Input
                    id="as2Url"
                    placeholder="https://as2.partner.com/receive"
                    value={formData.as2Url}
                    onChange={(e) => setFormData(prev => ({ ...prev, as2Url: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="encryptionAlgorithm">Encryption Algorithm</Label>
                  <select
                    id="encryptionAlgorithm"
                    value={formData.encryptionAlgorithm}
                    onChange={(e) => setFormData(prev => ({ ...prev, encryptionAlgorithm: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {encryptionAlgorithms.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signatureAlgorithm">Signature Algorithm</Label>
                  <select
                    id="signatureAlgorithm"
                    value={formData.signatureAlgorithm}
                    onChange={(e) => setFormData(prev => ({ ...prev, signatureAlgorithm: e.target.value }))}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground"
                  >
                    {signatureAlgorithms.map(a => (
                      <option key={a.value} value={a.value}>{a.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="encryptionCert">Encryption Certificate</Label>
                  <Input
                    id="encryptionCert"
                    placeholder="partner-encryption.cer"
                    value={formData.encryptionCert}
                    onChange={(e) => setFormData(prev => ({ ...prev, encryptionCert: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Upload or select from certificate store</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signingCert">Signing Certificate</Label>
                  <Input
                    id="signingCert"
                    placeholder="partner-signing.cer"
                    value={formData.signingCert}
                    onChange={(e) => setFormData(prev => ({ ...prev, signingCert: e.target.value }))}
                  />
                  <p className="text-xs text-muted-foreground">Upload or select from certificate store</p>
                </div>
              </div>

              <div className="border border-border rounded-lg p-4 space-y-3">
                <p className="font-medium text-foreground">MDN Settings</p>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mdnRequired}
                      onChange={(e) => setFormData(prev => ({ ...prev, mdnRequired: e.target.checked }))}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">Require MDN</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.mdnSigned}
                      onChange={(e) => setFormData(prev => ({ ...prev, mdnSigned: e.target.checked }))}
                      className="w-4 h-4 rounded border-border"
                    />
                    <span className="text-sm">Signed MDN</span>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Document Types */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                <p className="text-sm text-muted-foreground">
                  Select the EDI document types that will be exchanged with this trading partner.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {documentTypeOptions.map(doc => (
                  <label
                    key={doc.value}
                    className={`flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ${
                      formData.documentTypes.includes(doc.value)
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.documentTypes.includes(doc.value)}
                      onChange={() => toggleDocType(doc.value)}
                      className="w-4 h-4 rounded border-border"
                    />
                    <div>
                      <p className="font-medium text-foreground">{doc.value}</p>
                      <p className="text-xs text-muted-foreground">{doc.label.split(" - ")[1]}</p>
                    </div>
                  </label>
                ))}
              </div>

              {formData.documentTypes.length > 0 && (
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-sm font-medium text-foreground">
                    Selected: {formData.documentTypes.join(", ")}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-between gap-2 border-t border-border p-6 bg-card">
          <Button
            variant="outline"
            className="bg-transparent"
            onClick={() => step > 1 ? setStep(step - 1) : onClose()}
          >
            {step > 1 ? "Back" : "Cancel"}
          </Button>
          <div className="flex gap-2">
            {step < 3 ? (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={() => setStep(step + 1)}
                disabled={step === 1 && (!formData.name || !formData.code || !formData.email)}
              >
                Continue
              </Button>
            ) : (
              <Button
                className="bg-primary hover:bg-primary/90"
                onClick={handleSubmit}
                disabled={formData.documentTypes.length === 0}
              >
                Create Partner
              </Button>
            )}
          </div>
        </div>
      </Card>
    </div>
  )
}
