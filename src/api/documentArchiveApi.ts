import { API_BASE_URL } from './axios'

export interface DocumentArchiveDTO {
  id: number
  fileName: string
  originalFileName: string
  fileSize: number
  contentType: string | null
  title: string
  description: string | null
  category: string | null
  tags: string | null
  author: string | null
  uploadedBy: number
  uploadedByUsername: string | null
  uploadDate: string
  updateDate: string | null
  downloadCount: number
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

function authHeader(): Record<string, string> {
  const token = localStorage.getItem('token')
  return token ? { Authorization: `Bearer ${token}` } : {}
}

export async function fetchDocuments(page = 0, size = 20): Promise<PageResponse<DocumentArchiveDTO>> {
  const response = await fetch(`${API_BASE_URL}/document-archive?page=${page}&size=${size}`, {
    headers: authHeader(),
  })
  if (!response.ok) throw new Error(`Liste échouée (${response.status})`)
  return response.json()
}

export async function fetchDocumentById(id: number): Promise<DocumentArchiveDTO> {
  const response = await fetch(`${API_BASE_URL}/document-archive/${id}`, {
    headers: authHeader(),
  })
  if (response.status === 404) throw new Error('Document introuvable')
  if (!response.ok) throw new Error(`Erreur (${response.status})`)
  return response.json()
}

export async function fetchDocumentsByCategory(category: string): Promise<DocumentArchiveDTO[]> {
  const response = await fetch(`${API_BASE_URL}/document-archive/category/${encodeURIComponent(category)}`, {
    headers: authHeader(),
  })
  if (!response.ok) throw new Error(`Liste échouée (${response.status})`)
  return response.json()
}

export async function searchDocuments(query: string): Promise<DocumentArchiveDTO[]> {
  const response = await fetch(`${API_BASE_URL}/document-archive/search?q=${encodeURIComponent(query)}`, {
    headers: authHeader(),
  })
  if (!response.ok) throw new Error(`Recherche échouée (${response.status})`)
  return response.json()
}

export async function uploadDocument(formData: FormData): Promise<DocumentArchiveDTO> {
  const response = await fetch(`${API_BASE_URL}/document-archive/upload`, {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  })
  if (response.status === 400) throw new Error('Requête invalide (titre requis ou format non supporté : PDF/Word)')
  if (response.status === 401) throw new Error('Non authentifié')
  if (!response.ok) throw new Error(`Upload échoué (${response.status})`)
  return response.json()
}

export async function updateDocument(
  id: number,
  formData: FormData
): Promise<DocumentArchiveDTO> {
  const response = await fetch(`${API_BASE_URL}/document-archive/${id}`, {
    method: 'PUT',
    headers: authHeader(),
    body: formData,
  })
  if (response.status === 400) throw new Error('Requête invalide')
  if (response.status === 403) throw new Error('Modification réservée à l\'auteur ou un admin')
  if (response.status === 404) throw new Error('Document introuvable')
  if (!response.ok) throw new Error(`Mise à jour échouée (${response.status})`)
  return response.json()
}

export async function deleteDocument(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/document-archive/${id}`, {
    method: 'DELETE',
    headers: authHeader(),
  })
  if (response.status === 403) throw new Error('Suppression réservée à l\'auteur ou un admin')
  if (response.status === 404) throw new Error('Document introuvable')
  if (!response.ok) throw new Error(`Suppression échouée (${response.status})`)
}

export async function downloadDocument(id: number, fallbackName = `doc-${id}`): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/document-archive/download/${id}`, {
    headers: authHeader(),
  })
  if (response.status === 404) throw new Error('Fichier physique introuvable')
  if (!response.ok) throw new Error(`Téléchargement impossible (${response.status})`)

  const blob = await response.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  const cd = response.headers.get('Content-Disposition')
  const m = cd?.match(/filename\*?=(?:UTF-8'')?"?([^";]+)"?/i)
  a.download = m ? decodeURIComponent(m[1]) : fallbackName
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}
