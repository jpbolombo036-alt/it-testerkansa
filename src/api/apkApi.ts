import api from './axios'
import { API_BASE_URL } from '../config'

export interface ApkFileDTO {
  id: number
  fileName: string
  originalFileName: string
  fileSize: number
  version: string | null
  packageName: string | null
  description: string | null
  applicationId: number | null
  uploadedBy: number
  uploadDate: string
  downloadCount: number
  environnement: string | null
}

export interface ApkUpdateData {
  version?: string
  packageName?: string
  description?: string
  applicationId?: number
  environnement?: string
}

export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export async function fetchApks(page = 0, size = 20): Promise<ApkFileDTO[]> {
  const response = await api.get<PageResponse<ApkFileDTO> | ApkFileDTO[]>('/apk', { params: { page, size } })
  const data = response.data
  if (Array.isArray(data)) return data
  return data.content
}

export async function fetchApksByApplication(applicationId: number, page = 0, size = 20): Promise<ApkFileDTO[]> {
  const response = await api.get<PageResponse<ApkFileDTO> | ApkFileDTO[]>(`/apk/application/${applicationId}`, { params: { page, size } })
  const data = response.data
  if (Array.isArray(data)) return data
  return data.content
}

export async function fetchApkById(id: number): Promise<ApkFileDTO> {
  const response = await api.get<ApkFileDTO>(`/apk/${id}`)
  return response.data
}

export async function uploadApk(
  file: File,
  meta: {
    applicationId?: number
    version?: string
    packageName?: string
    description?: string
  }
): Promise<ApkFileDTO> {
  const formData = new FormData()
  formData.append('file', file)
  if (meta.applicationId != null) formData.append('applicationId', String(meta.applicationId))
  if (meta.version) formData.append('version', meta.version)
  if (meta.packageName) formData.append('packageName', meta.packageName)
  if (meta.description) formData.append('description', meta.description)

  const response = await api.post<ApkFileDTO>('/apk/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return response.data
}

export async function downloadApk(id: number, fallbackFilename?: string) {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}/apk/download/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  })
  if (!res.ok) throw new Error(`Téléchargement impossible (${res.status})`)
  const blob = await res.blob()
  const cd = res.headers.get('content-disposition')
  let filename = fallbackFilename || `apk-${id}.apk`
  if (cd) {
    const match = cd.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
    if (match) filename = decodeURIComponent(match[1])
  }
  return { blob, filename }
}

export async function deleteApk(id: number): Promise<void> {
  await api.delete(`/apk/${id}`)
}

export async function updateApk(id: number, data: ApkUpdateData): Promise<ApkFileDTO> {
  const response = await api.put<ApkFileDTO>(`/apk/${id}`, data)
  return response.data
}