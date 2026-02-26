"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Receipt,
  CheckCheck,
} from "lucide-react"
import { toast } from "sonner"
import type { Notification } from "@/lib/types"

const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "job_completed",
    title: "Задача завершена",
    message: 'Обработка листа "Sheet1" завершена. Найдено 245 телефонов.',
    read: false,
    created_at: "2025-06-15T14:30:00Z",
  },
  {
    id: "2",
    type: "billing_updated",
    title: "Биллинг обновлён",
    message: "Начислено 4 900 руб за период Июнь 2025.",
    read: false,
    created_at: "2025-06-14T10:00:00Z",
  },
  {
    id: "3",
    type: "system",
    title: "Плановое обслуживание",
    message: "Система будет недоступна 20 июня с 02:00 до 04:00 МСК.",
    read: true,
    created_at: "2025-06-13T09:00:00Z",
  },
  {
    id: "4",
    type: "warning",
    title: "Задолженность",
    message: "У вас имеется задолженность 12 500 руб. Пожалуйста, оплатите.",
    read: true,
    created_at: "2025-06-12T16:00:00Z",
  },
  {
    id: "5",
    type: "job_completed",
    title: "Задача завершена",
    message: 'Обработка листа "Sheet2" завершена. Найдено 189 телефонов.',
    read: true,
    created_at: "2025-06-10T11:20:00Z",
  },
  {
    id: "6",
    type: "system",
    title: "Добро пожаловать",
    message: "Ваш аккаунт успешно создан. Добро пожаловать в AIVEK!",
    read: true,
    created_at: "2025-06-01T08:00:00Z",
  },
]

const typeConfig: Record<
  string,
  { icon: typeof Bell; label: string; color: string }
> = {
  job_completed: {
    icon: CheckCircle2,
    label: "Задача",
    color: "text-success",
  },
  billing_updated: {
    icon: Receipt,
    label: "Биллинг",
    color: "text-primary",
  },
  system: {
    icon: Info,
    label: "Система",
    color: "text-muted-foreground",
  },
  warning: {
    icon: AlertTriangle,
    label: "Предупреждение",
    color: "text-warning",
  },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] =
    useState<Notification[]>(initialNotifications)
  const [filter, setFilter] = useState("all")

  const unreadCount = notifications.filter((n) => !n.read).length

  function handleMarkAllRead() {
    setNotifications(notifications.map((n) => ({ ...n, read: true })))
    toast.success("Все уведомления отмечены как прочитанные")
  }

  function handleMarkRead(id: string) {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      )
    )
  }

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
        ? notifications.filter((n) => !n.read)
        : notifications.filter((n) => n.type === filter)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Уведомления</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0
              ? `${unreadCount} непрочитанных`
              : "Нет новых уведомлений"}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="mr-2 h-4 w-4" />
            Прочитать все
          </Button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Фильтр" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Все</SelectItem>
            <SelectItem value="unread">Непрочитанные</SelectItem>
            <SelectItem value="job_completed">Задачи</SelectItem>
            <SelectItem value="billing_updated">Биллинг</SelectItem>
            <SelectItem value="system">Система</SelectItem>
            <SelectItem value="warning">Предупреждения</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">
          {filtered.length} уведомлений
        </span>
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Bell className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Нет уведомлений по выбранному фильтру
              </p>
            </CardContent>
          </Card>
        ) : (
          filtered.map((notification) => {
            const config = typeConfig[notification.type] || typeConfig.system
            const Icon = config.icon

            return (
              <Card
                key={notification.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  !notification.read ? "border-primary/30 bg-primary/5" : ""
                }`}
                onClick={() => handleMarkRead(notification.id)}
              >
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`mt-0.5 shrink-0 ${config.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <Badge
                          variant="default"
                          className="h-5 px-1.5 text-[10px]"
                        >
                          Новое
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {notification.message}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(notification.created_at).toLocaleString(
                        "ru-RU",
                        {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </p>
                  </div>
                  <Badge variant="outline" className="shrink-0 text-xs">
                    {config.label}
                  </Badge>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
