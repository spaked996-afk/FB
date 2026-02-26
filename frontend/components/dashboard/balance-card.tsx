"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Wallet } from "lucide-react"
import type { BalanceResponse } from "@/lib/types"

interface BalanceCardProps {
  balance: BalanceResponse | null
  isLoading: boolean
}

export function BalanceCard({ balance, isLoading }: BalanceCardProps) {
  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-4 p-6">
          <div className="rounded-lg bg-primary/10 p-3">
            <Wallet className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Баланс API</p>
            <div className="mt-1 h-6 w-24 animate-pulse rounded bg-muted" />
          </div>
        </CardContent>
      </Card>
    )
  }

  const hasBalance = balance !== null && balance.balance !== null

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-6">
        <div className="rounded-lg bg-primary/10 p-3">
          <Wallet className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">Баланс API</p>
          {hasBalance ? (
            <p className="text-xl font-bold text-foreground">
              {balance.balance!.toLocaleString("ru-RU")} руб
            </p>
          ) : (
            <p className="text-sm text-muted-foreground">
              Нет данных о балансе
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
