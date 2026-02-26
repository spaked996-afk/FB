"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DollarSign, RefreshCw, Lock, Loader2, Info } from "lucide-react"
import { toast } from "sonner"
import type { AdminClientRow } from "@/lib/types"

interface FinancePanelProps {
  clients: AdminClientRow[]
}

export function FinancePanel({ clients }: FinancePanelProps) {
  const [selectedClient, setSelectedClient] = useState("")
  const [actionLoading, setActionLoading] = useState("")

  const selected = clients.find((c) => c.client_id === selectedClient)

  async function handleRecalculate() {
    if (!selectedClient) return
    setActionLoading("recalculate")
    try {
      const res = await fetch(
        `/api/proxy/billing/recalculate/${selectedClient}`,
        { method: "POST" }
      )
      if (res.ok) {
        toast.success("Пересчёт выполнен")
      } else {
        toast.error("Ошибка пересчёта: endpoint не реализован на backend")
      }
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setActionLoading("")
    }
  }

  async function handleClose() {
    if (!selectedClient) return
    setActionLoading("close")
    try {
      const res = await fetch(
        `/api/proxy/billing/close/${selectedClient}`,
        { method: "POST" }
      )
      if (res.ok) {
        toast.success("Период закрыт")
      } else {
        toast.error("Ошибка закрытия: endpoint не реализован на backend")
      }
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setActionLoading("")
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <DollarSign className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Управление финансами</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select value={selectedClient} onValueChange={setSelectedClient}>
          <SelectTrigger>
            <SelectValue placeholder="Выберите клиента" />
          </SelectTrigger>
          <SelectContent>
            {clients.map((client) => (
              <SelectItem key={client.client_id} value={client.client_id}>
                {client.username} ({client.client_id})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected && (
          <>
            <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-xs text-muted-foreground">За период</p>
                <p className="text-sm font-medium text-foreground">
                  {selected.current_period.toLocaleString("ru-RU")} руб
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Оплачено</p>
                <p className="text-sm font-medium text-foreground">
                  {selected.total_paid.toLocaleString("ru-RU")} руб
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Долг</p>
                <p
                  className={`text-sm font-medium ${
                    selected.debt > 0 ? "text-destructive" : "text-success"
                  }`}
                >
                  {selected.debt.toLocaleString("ru-RU")} руб
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRecalculate}
                disabled={!!actionLoading}
              >
                {actionLoading === "recalculate" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="mr-2 h-4 w-4" />
                )}
                Пересчитать
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleClose}
                disabled={!!actionLoading}
              >
                {actionLoading === "close" ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Lock className="mr-2 h-4 w-4" />
                )}
                Закрыть период
              </Button>
            </div>
          </>
        )}

        {!selectedClient && (
          <div className="flex flex-col items-center py-4">
            <Info className="mb-2 h-5 w-5 text-muted-foreground" />
            <p className="text-center text-sm text-muted-foreground">
              Выберите клиента для просмотра финансовых данных
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
