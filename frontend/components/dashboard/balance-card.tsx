"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import type { BalanceInfo } from "@/lib/types"

interface BalanceCardProps {
  balance: BalanceInfo | null
  isLoading: boolean
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  if (isLoading || !balance) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-primary/10 p-3">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Баланс</p>
            <div className="mt-1 h-6 w-24 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const debtColor =
    balance.debt <= 0
      ? "text-success"
      : balance.debt < 5000
        ? "text-warning"
        : "text-destructive"

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">
            Период: {balance.current_period}
          </p>
          <div className="flex items-baseline gap-3">
            <p className="text-xl font-bold text-foreground">
              {balance.phones_found} телефонов
            </p>
            <p className={`text-sm font-medium ${debtColor}`}>
              {balance.debt > 0
                ? `Долг: ${balance.debt.toLocaleString("ru-RU")} руб`
                : "Оплачено"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
