"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Receipt } from "lucide-react"
import type { BillingInfo } from "@/lib/types"

interface BillingCardProps {
  billing: BillingInfo | null
  isLoading: boolean
}

export function BillingCard({ billing, isLoading }: BillingCardProps) {
  if (isLoading || !billing) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <Receipt className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Биллинг</h3>
        </CardHeader>
        <CardContent>
          <div className="h-32 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <Receipt className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Биллинг</h3>
          <p className="text-xs text-muted-foreground">
            Период: {billing.current_period}
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Найдено</p>
            <p className="text-lg font-bold text-foreground">
              {billing.total_found}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Итого</p>
            <p className="text-lg font-bold text-foreground">
              {billing.total_cost.toLocaleString("ru-RU")} руб
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Долг</p>
            <p
              className={`text-lg font-bold ${
                billing.debt > 0 ? "text-destructive" : "text-success"
              }`}
            >
              {billing.debt.toLocaleString("ru-RU")} руб
            </p>
          </div>
        </div>

        {billing.sheets && billing.sheets.length > 0 && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Лист</TableHead>
                <TableHead className="text-right">Телефоны</TableHead>
                <TableHead className="text-right">Стоимость</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {billing.sheets.map((sheet) => (
                <TableRow key={sheet.sheet_name}>
                  <TableCell className="font-medium text-foreground">
                    {sheet.sheet_name}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {sheet.phones_found}
                  </TableCell>
                  <TableCell className="text-right text-foreground">
                    {sheet.cost.toLocaleString("ru-RU")} руб
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
