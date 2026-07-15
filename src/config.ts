const rawUrl = import.meta.env.VITE_API_BASE_URL

const DEFAULT_API_BASE_URL = 'http://localhost:8080'

const normalizeApiUrl = (url: string): string => {
  const trimmed = url.trim()
  return trimmed.endsWith('/') ? trimmed.slice(0, -1) : trimmed
}

export const API_BASE_URL: string = rawUrl && rawUrl.trim() !== ''
  ? normalizeApiUrl(rawUrl)
  : DEFAULT_API_BASE_URL
