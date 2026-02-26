"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Bell, Info } from "lucide-react"

export default function NotificationsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
        <p className="text-sm text-muted-foreground">
          Системные уведомления и оповещения
        </p>
      </div>

      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-lg bg-muted p-3">
            <Bell className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            Уведомления временно недоступны
          </p>
          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
            <Info className="h-3 w-3" />
            API уведомлений находится в разработке
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
