export interface AttendanceDTO {
  id: number
  agentId: number
  agentUsername: string
  date: string
  checkInTime: string | null
  checkOutTime: string | null
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'
  reason: string | null
  createdBy: number
  createdAt: string
}

export interface AttendanceReportDTO extends AttendanceDTO {
  duration: string
}

export interface AttendanceDashboardDTO {
  date: string
  totalPresent: number
  totalAbsent: number
  totalLate: number
  totalOnLeave: number
  totalAgents: number
  attendances: AttendanceReportDTO[]
  statusDistribution: Record<string, number>
  attendanceRate: number
}

export interface PageResponse<T> {
  content: T[]
  currentPage: number
  pageSize: number
  totalElements: number
  totalPages: number
  first: boolean
  last: boolean
}

export interface CreateAttendanceDTO {
  agentId: number
  date: string
  checkInTime?: string
  checkOutTime?: string
  status: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'
  reason?: string
}

export interface UpdateAttendanceDTO {
  checkInTime?: string | null
  checkOutTime?: string | null
  status?: 'PRESENT' | 'LATE' | 'ABSENT' | 'LEAVE'
  reason?: string | null
}