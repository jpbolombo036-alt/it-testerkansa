import api from './axios'

export interface ApkFile {
  id: number
  version: string
  description: string
  downloadCount: number
  originalFileName: string
  packageName?: string
}

export async function fetchApks() {
  const response = await api.get<ApkFile[]>('/apk')
  return response.data
}

export async function uploadApk(file: File, applicationId: number, version: string, packageName: string, description: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('applicationId', applicationId.toString())
  formData.append('version', version)
  formData.append('packageName', packageName)
  formData.append('description', description)

  const response = await api.post('/apk/upload', formData)
  return response.data
}

export async function downloadApk(id: number) {
  const response = await api.get(`/apk/download/${id}`, { responseType: 'blob' })
  return response.data
}

export async function deleteApk(id: number) {
  await api.delete(`/apk/${id}`)
}