// -------------------------------------------------------
// Types aligned with real FastAPI backend DTOs
// -------------------------------------------------------

// GET /jobs/{client_id} — active job polling
export interface ActiveJobResponse {
  job_id: string | null
  status: "running" | "idle"
  progress_current: number
  progress_total: number
  found: number
}

// GET /jobs/{client_id}/{job_id} — full job details
export interface JobDetail {
  running: boolean
  progress_current: number
  progress_total: number
  found: number
  logs: LogEntry[]
  worksheet_name: string
}

// Log entries inside job or from GET /jobs/{client_id}/{job_id}/logs
export interface LogEntry {
  timestamp: string
  level: string
  message: string
}

// GET /balance/{client_id}
export interface BalanceResponse {
  balance: number | null
}

// GET /clients/{client_id}/config
export interface ClientConfigResponse {
  client_id: string
  config: Record<string, string>
  sheets: string[]
}

// GET /admin/overview
export interface AdminOverviewResponse {
  clients: AdminClientRow[]
  stats: AdminStats
}

export interface AdminStats {
  total_clients: number
  active_tasks: number
  total_period: number
  total_debt: number
}

export interface AdminClientRow {
  username: string
  client_id: string
  running: boolean
  active_job_id: string | null
  progress: number
  current_period: number
  total_paid: number
  debt: number
}

// Kept for future API use (no backend endpoints yet)
export interface UserInfo {
  username: string
  role: "admin" | "client"
  client_id?: string
  is_active: boolean
  created_at: string
}

export interface Notification {
  id: string
  type: string
  title: string
  message: string
  read: boolean
  created_at: string
}
