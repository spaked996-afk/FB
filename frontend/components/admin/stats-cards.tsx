"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Users, Zap, TrendingUp, AlertTriangle } from "lucide-react"
import type { AdminStats } from "@/lib/types"

interface StatsCardsProps {
  stats: AdminStats | null
  isLoading: boolean
}

const statsDef = [
  {
    key: "total_clients" as const,
    label: "Клиенты",
    icon: Users,
    format: (v: number) => String(v),
  },
  {
    key: "active_tasks" as const,
    label: "Активные задачи",
    icon: Zap,
    format: (v: number) => String(v),
  },
  {
    key: "total_period" as const,
    label: "За период",
    icon: TrendingUp,
    format: (v: number) => `${v.toLocaleString("ru-RU")} руб.`,
  },
  {
    key: "total_debt" as const,
    label: "Общий долг",
    icon: AlertTriangle,
    format: (v: number) => `${v.toLocaleString("ru-RU")} руб.`,
  },
]

export function StatsCards({ stats, isLoading }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {statsDef.map((def) => {
        const Icon = def.icon
        const value = stats ? stats[def.key] : 0
        const isDebt = def.key === "total_debt" && value > 0

        return (
          <Card key={def.key}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-lg p-3 ${isDebt ? "bg-destructive/10" : "bg-primary/10"}`}>
                <Icon className={`h-5 w-5 ${isDebt ? "text-destructive" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {def.label}
                </p>
                {isLoading ? (
                  <div className="mt-1 h-6 w-16 animate-pulse rounded bg-muted" />
                ) : (
                  <p className={`text-xl font-bold ${isDebt ? "text-destructive" : "text-foreground"}`}>
                    {def.format(value)}
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
