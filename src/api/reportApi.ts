import api from './axios'

export interface ReportDefinition {
  id: string
  title: string
  description: string
  lastGenerated?: string
}

export interface ReportGeneration {
  id: number
  reportType: string
  title: string
  type: string
  status: string
  generatedAt: string
  generatedBy?: number
  generatedByUsername?: string
}

export async function fetchReportDefinitions() {
  const response = await api.get<ReportDefinition[]>('/reports')
  return response.data
}

export async function generateReport(type: string) {
  const response = await api.post<ReportGeneration>(`/reports/${type}/generate`)
  return response.data
}

export async function fetchReportHistory() {
  const response = await api.get<ReportGeneration[]>('/reports/history')
  return response.data
}

export async function downloadReport(id: number) {
  const response = await api.get(`/reports/${id}/download`, { responseType: 'blob' })
  const url = window.URL.createObjectURL(new Blob([response.data]))
  const filename = getFilenameFromContentDisposition(response.headers['content-disposition']) || `rapport-${id}.txt`

  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  window.URL.revokeObjectURL(url)
}

function getFilenameFromContentDisposition(contentDisposition?: string) {
  if (!contentDisposition) return null
  const match = contentDisposition.match(/filename="?([^"]+)"?/)
  return match?.[1] || null
}
