"use client"

import { useCallback, useState } from "react"
import useSWR from "swr"
import { useSession } from "@/hooks/use-session"
import { BalanceCard } from "@/components/dashboard/balance-card"
import { JobControls } from "@/components/dashboard/job-controls"
import { JobStatus } from "@/components/dashboard/job-status"
import { JobLogs } from "@/components/dashboard/job-logs"
import { BillingCard } from "@/components/dashboard/billing-card"
import type {
  ActiveJobResponse,
  LogEntry,
  BalanceResponse,
  ClientConfigResponse,
} from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function DashboardPage() {
  const { session, isLoading: sessionLoading } = useSession()
  const clientId = session?.clientId || ""
  const [pollKey, setPollKey] = useState(0)

  const { data: config } = useSWR<ClientConfigResponse>(
    clientId ? `/api/proxy/clients/${clientId}/config` : null,
    fetcher,
    { revalidateOnFocus: false }
  )

  const {
    data: activeJob,
    mutate: mutateJob,
  } = useSWR<ActiveJobResponse>(
    clientId ? `/api/proxy/jobs/${clientId}?_k=${pollKey}` : null,
    fetcher,
    {
      refreshInterval: (data) =>
        data?.status === "running" ? 2000 : 0,
      revalidateOnFocus: false,
    }
  )

  const { data: logs = [] } = useSWR<LogEntry[]>(
    clientId && activeJob?.job_id
      ? `/api/proxy/jobs/${clientId}/${activeJob.job_id}/logs`
      : null,
    fetcher,
    {
      refreshInterval: () =>
        activeJob?.status === "running" ? 2000 : 0,
      revalidateOnFocus: false,
    }
  )

  const { data: balance, isLoading: balanceLoading } =
    useSWR<BalanceResponse>(
      clientId ? `/api/proxy/balance/${clientId}` : null,
      fetcher,
      { revalidateOnFocus: false }
    )

  const handleJobStarted = useCallback(() => {
    setPollKey((k) => k + 1)
    mutateJob()
  }, [mutateJob])

  const handleJobStopped = useCallback(() => {
    mutateJob()
  }, [mutateJob])

  if (sessionLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  const isRunning = activeJob?.status === "running"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Панель управления
        </h1>
        <p className="text-sm text-muted-foreground">
          Управление задачами обогащения данных
        </p>
      </div>

      <BalanceCard balance={balance ?? null} isLoading={balanceLoading} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <JobControls
          sheets={config?.sheets ?? []}
          clientId={clientId}
          isRunning={isRunning}
          activeJobId={activeJob?.job_id ?? null}
          onJobStarted={handleJobStarted}
          onJobStopped={handleJobStopped}
        />
        <JobStatus job={activeJob ?? null} isLoading={false} />
      </div>

      <JobLogs logs={logs} isLoading={false} />

      <BillingCard />
    </div>
  )
}
