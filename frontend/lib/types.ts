export interface JobInfo {
  job_id: string
  client_id: string
  sheet_name: string
  status: "pending" | "running" | "completed" | "error" | "stopped"
  total_rows: number
  processed_rows: number
  found_phones: number
  started_at: string
  finished_at?: string
  error_message?: string
}

export interface LogEntry {
  timestamp: string
  level: "info" | "success" | "error" | "warning" | "cache"
  message: string
}

export interface BalanceInfo {
  client_id: string
  current_period: string
  phones_found: number
  total_cost: number
  paid: number
  debt: number
}

export interface BillingInfo {
  client_id: string
  current_period: string
  sheets: SheetBilling[]
  total_found: number
  total_cost: number
  paid: number
  debt: number
}

export interface SheetBilling {
  sheet_name: string
  phones_found: number
  cost: number
}

export interface ClientConfig {
  client_id: string
  username: string
  spreadsheet_id: string
  sheets: string[]
  price_per_phone: number
}

export interface AdminOverview {
  total_clients: number
  active_jobs: number
  total_revenue: number
  total_debt: number
  clients: AdminClientInfo[]
}

export interface AdminClientInfo {
  client_id: string
  username: string
  active_job: JobInfo | null
  balance: BalanceInfo
}

export interface UserInfo {
  username: string
  role: "admin" | "client"
  client_id?: string
  is_active: boolean
  created_at: string
}

export interface Notification {
  id: string
  type: "job_completed" | "billing_updated" | "system" | "warning"
  title: string
  message: string
  read: boolean
  created_at: string
}
