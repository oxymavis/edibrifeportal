import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Makes a string safe for use as a filename (no path chars or invalid chars). */
export function safeFilename(name: string): string {
  const s = name.replace(/[/\\:*?"<>|]/g, '_').trim()
  return s || 'download'
}

/** Download text as a file with correct MIME and revoke URL after. */
export function downloadText(filename: string, text: string, mime = 'text/plain; charset=utf-8'): void {
  const safe = safeFilename(filename)
  const blob = new Blob([text], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = safe
  a.click()
  URL.revokeObjectURL(url)
}

/** Download JSON as a file with correct MIME and revoke URL after. */
export function downloadJson(filename: string, data: unknown): void {
  downloadText(filename, JSON.stringify(data, null, 2), 'application/json; charset=utf-8')
}

/** Download CSV with UTF-8 BOM so Excel opens it correctly; revoke URL after. */
export function downloadCsv(filename: string, csvContent: string): void {
  downloadText(filename, '\uFEFF' + csvContent, 'text/csv; charset=utf-8')
}
