import api from './axios'
import { BlocNoteDTO, BlocNoteRequest } from '../dto/BlocNoteDTO'

export async function fetchAllNotes() {
  const response = await api.get<BlocNoteDTO[]>('/bloc-notes')
  return response.data
}

export async function fetchNoteById(id: number) {
  const response = await api.get<BlocNoteDTO>(`/bloc-notes/${id}`)
  return response.data
}

export async function createNote(data: BlocNoteRequest) {
  const response = await api.post<BlocNoteDTO>('/bloc-notes', data)
  return response.data
}

export async function updateNote(id: number, data: BlocNoteRequest) {
  const response = await api.put<BlocNoteDTO>(`/bloc-notes/${id}`, data)
  return response.data
}

export async function deleteNote(id: number) {
  await api.delete(`/bloc-notes/${id}`)
}