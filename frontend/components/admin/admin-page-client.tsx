"use client"

import useSWR from "swr"
import { StatsCards } from "@/components/admin/stats-cards"
import { ClientsTable } from "@/components/admin/clients-table"
import { FinancePanel } from "@/components/admin/finance-panel"
import type { AdminOverviewResponse } from "@/lib/types"

const fetcher = async (url: string) => {
  const res = await fetch(url)
  if (!res.ok) throw new Error("Failed")
  return res.json()
}

export default function AdminPageClient() {
  const { data, isLoading } = useSWR<AdminOverviewResponse>(
    "/api/proxy/admin/overview",
    fetcher,
    { revalidateOnFocus: false }
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Обзор</h1>
        <p className="text-sm text-muted-foreground">
          Общая статистика и управление клиентами
        </p>
      </div>

      <StatsCards stats={data?.stats ?? null} isLoading={isLoading} />

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <ClientsTable clients={data?.clients ?? []} isLoading={isLoading} />
        </div>
        <div>
          <FinancePanel clients={data?.clients ?? []} />
        </div>
      </div>
    </div>
  )
}
