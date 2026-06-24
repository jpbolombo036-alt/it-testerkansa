import api from './axios'

export interface DocumentArchive {
  id?: number
  fileName: string
  originalFileName: string
  fileSize: number
  contentType: string
  title: string
  description?: string
  category?: string
  tags?: string
  author?: string
  uploadedBy: number
  uploadedByUsername: string
  uploadDate: string
  downloadCount?: number
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

export interface DocumentArchiveRequest {
  title: string
  description?: string
  category?: string
  tags?: string
  author?: string
}

export async function fetchDocuments(page = 0, size = 20) {
  const response = await api.get<PageResponse<DocumentArchive>>('/document-archive', { params: { page, size } })
  return response.data
}

export async function fetchDocumentById(id: number) {
  const response = await api.get<DocumentArchive>(`/document-archive/${id}`)
  return response.data
}

export async function fetchDocumentsByCategory(category: string) {
  const response = await api.get<DocumentArchive[]>(`/document-archive/category/${encodeURIComponent(category)}`)
  return response.data
}

export async function searchDocuments(query: string) {
  const response = await api.get<DocumentArchive[]>(`/document-archive/search`, { params: { q: query } })
  return response.data
}

export async function uploadDocument(formData: FormData) {
  const response = await api.post('/document-archive/upload', formData)
  return response.data
}

export async function deleteDocument(id: number) {
  await api.delete(`/document-archive/${id}`)
}
