import api from './axios'

export interface ApkFile {
  id: number
  version: string
  description: string
  downloadUrl: string
  downloadCount: number
}

export async function fetchApks() {
  const response = await api.get<ApkFile[]>('/apk')
  return response.data
}

export async function uploadApk(file: File, applicationId: number, version: string, description: string) {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('applicationId', applicationId.toString())
  formData.append('version', version)
  formData.append('description', description)

  const response = await api.post('/apk/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return response.data
}