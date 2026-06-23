import api from './axios'
import { AttendanceDTO, AttendanceReportDTO, AttendanceDashboardDTO, PageResponse, CreateAttendanceDTO, UpdateAttendanceDTO } from '../dto/AttendanceDTO'

export type { AttendanceDTO, AttendanceReportDTO, AttendanceDashboardDTO, PageResponse, CreateAttendanceDTO, UpdateAttendanceDTO }

export async function fetchTodayDashboard(): Promise<AttendanceDashboardDTO> {
  const response = await api.get<AttendanceDashboardDTO>('/attendance-dashboard/today')
  return response.data
}

export async function fetchAttendances(page = 0, size = 25, sortBy = 'date', sortDir = 'desc'): Promise<PageResponse<AttendanceDTO>> {
  const response = await api.get<PageResponse<AttendanceDTO>>(`/attendances?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`)
  return response.data
}

export async function fetchAttendanceById(id: number): Promise<AttendanceDTO> {
  const response = await api.get<AttendanceDTO>(`/attendances/${id}`)
  return response.data
}

export async function fetchAttendancesByAgent(agentId: number, page = 0, size = 25): Promise<PageResponse<AttendanceDTO>> {
  const response = await api.get<PageResponse<AttendanceDTO>>(`/attendances/agent/${agentId}?page=${page}&size=${size}`)
  return response.data
}

export async function fetchAttendancesByAgentRange(agentId: number, start: string, end: string): Promise<AttendanceDTO[]> {
  const response = await api.get<AttendanceDTO[]>(`/attendances/agent/${agentId}/range?start=${start}&end=${end}`)
  return response.data
}

export async function fetchAttendancesByDate(date: string, page = 0, size = 25): Promise<PageResponse<AttendanceDTO>> {
  const response = await api.get<PageResponse<AttendanceDTO>>(`/attendances/date/${date}?page=${page}&size=${size}`)
  return response.data
}

export async function checkIn(): Promise<AttendanceDTO> {
  const response = await api.post<AttendanceDTO>('/attendances/check-in')
  return response.data
}

export async function checkOut(): Promise<AttendanceDTO> {
  const response = await api.post<AttendanceDTO>('/attendances/check-out')
  return response.data
}

export async function createAttendance(data: CreateAttendanceDTO): Promise<AttendanceDTO> {
  const response = await api.post<AttendanceDTO>('/attendances', data)
  return response.data
}

export async function updateAttendance(id: number, data: UpdateAttendanceDTO): Promise<AttendanceDTO> {
  const response = await api.put<AttendanceDTO>(`/attendances/${id}`, data)
  return response.data
}

export async function deleteAttendance(id: number): Promise<void> {
  await api.delete(`/attendances/${id}`)
}