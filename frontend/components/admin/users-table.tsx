"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Users, Info } from "lucide-react"

export function UsersTable() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Управление пользователями
            </h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center py-12">
          <div className="rounded-lg bg-muted p-3">
            <Info className="h-6 w-6 text-muted-foreground" />
          </div>
          <p className="mt-3 text-sm font-medium text-foreground">
            API управления пользователями не подключён
          </p>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            Эндпоинты для создания, редактирования и удаления пользователей ещё не реализованы на backend.
            Управление учётными записями доступно напрямую через файл users.json на сервере.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
