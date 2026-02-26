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
import { DollarSign, RefreshCw, Lock, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { AdminClientInfo, BillingInfo } from "@/lib/types"

interface FinancePanelProps {
  clients: AdminClientInfo[]
}

export function FinancePanel({ clients }: FinancePanelProps) {
  const [selectedClient, setSelectedClient] = useState("")
  const [billing, setBilling] = useState<BillingInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState("")

  async function fetchBilling(clientId: string) {
    setLoading(true)
    try {
      const res = await fetch(`/api/proxy/billing/${clientId}`)
      if (res.ok) {
        const data = await res.json()
        setBilling(data)
      }
    } catch {
      toast.error("Не удалось загрузить биллинг")
    } finally {
      setLoading(false)
    }
  }

  function handleClientChange(value: string) {
    setSelectedClient(value)
    setBilling(null)
    if (value) {
      fetchBilling(value)
    }
  }

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
        fetchBilling(selectedClient)
      } else {
        toast.error("Ошибка пересчёта")
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
        fetchBilling(selectedClient)
      } else {
        toast.error("Ошибка закрытия периода")
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
        <Select value={selectedClient} onValueChange={handleClientChange}>
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

        {loading && (
          <div className="flex justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
          </div>
        )}

        {billing && !loading && (
          <>
            <div className="grid grid-cols-3 gap-4 rounded-lg border border-border p-4">
              <div>
                <p className="text-xs text-muted-foreground">Период</p>
                <p className="text-sm font-medium text-foreground">
                  {billing.current_period}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Оплачено</p>
                <p className="text-sm font-medium text-foreground">
                  {billing.paid.toLocaleString("ru-RU")} руб
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Долг</p>
                <p
                  className={`text-sm font-medium ${
                    billing.debt > 0 ? "text-destructive" : "text-success"
                  }`}
                >
                  {billing.debt.toLocaleString("ru-RU")} руб
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

        {!selectedClient && !loading && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Выберите клиента для управления биллингом
          </p>
        )}
      </CardContent>
    </Card>
  )
}
