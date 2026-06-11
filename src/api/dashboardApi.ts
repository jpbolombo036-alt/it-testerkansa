import api from './axios'

export interface DashboardStats {
  applications: number
  sessions: number
  tests: number
  users: number
  accounts: number
  testsOk: number
  testsBug: number
  testsEnCours: number
  testsRateOk: number
  testsRateBug: number
  testsRatePending: number
  activeAccounts: number
  recentSessions: number
  bugReports: number
}

export interface AgentPerformance {
  agentName: string;
  bugsFound: number;
  testsExecuted: number;
  bugRate: number; // (bugsFound / testsExecuted) * 100
}

export async function fetchDashboardStats(): Promise<DashboardStats> {
  const response = await api.get<DashboardStats>('/dashboard/stats')
  return response.data
}