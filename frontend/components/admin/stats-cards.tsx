"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import type { AdminOverview } from "@/lib/types"

interface StatsCardsProps {
  data: AdminOverview | null
  isLoading: boolean
}

const stats = [
  {
    key: "total_clients" as const,
    label: "Клиенты",
    icon: Users,
    format: (v?: number) => String(v ?? 0),
  },
  {
    key: "active_jobs" as const,
    label: "Активные задачи",
    icon: Zap,
    format: (v?: number) => String(v ?? 0),
  },
  {
    key: "total_revenue" as const,
    label: "Выручка",
    icon: TrendingUp,
    format: (v?: number) =>
      `${(v ?? 0).toLocaleString("ru-RU")} руб.`,
  },
  {
    key: "total_debt" as const,
    label: "Общий долг",
    icon: AlertTriangle,
    format: (v?: number) =>
      `${(v ?? 0).toLocaleString("ru-RU")} руб.`,
  },
]

export function StatsCards({ data, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        const value = data ? data[stat.key] : 0
        const isDebt = stat.key === "total_debt" && value > 0

        return (
          <Card key={stat.key}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${isDebt ? "bg-destructive/10" : "bg-primary/10"}`}>
                <Icon className={`h-5 w-5 ${isDebt ? "text-destructive" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {stat.label}
                </p>
                {isLoading ? (
                  <div className="mt-1 h-6 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className={`text-xl font-bold ${isDebt ? "text-destructive" : "text-foreground"}`}>
                    {stat.format(value)}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
