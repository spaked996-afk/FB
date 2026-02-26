"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Receipt, Info } from "lucide-react"

export function BillingCard() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <Receipt className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Биллинг</h3>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-8">
          <div className="rounded-lg bg-muted p-3">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            Биллинг временно недоступен
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            API биллинга находится в разработке
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
