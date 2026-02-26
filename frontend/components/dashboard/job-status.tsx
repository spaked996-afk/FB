"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Phone, Clock, Hash } from "lucide-react"
import type { JobInfo } from "@/lib/types"

interface JobStatusProps {
  job: JobInfo | null
  isLoading: boolean
}

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Ожидание", variant: "secondary" },
  running: { label: "Выполняется", variant: "default" },
  completed: { label: "Завершено", variant: "outline" },
  error: { label: "Ошибка", variant: "destructive" },
  stopped: { label: "Остановлено", variant: "secondary" },
}

export function JobStatus({ job, isLoading }: JobStatusProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Статус задачи</h3>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded bg-muted" />
        </CardContent>
      </Card>
    )
  }

  if (!job) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Статус задачи</h3>
        </CardHeader>
        <CardContent>
          <p className="py-4 text-center text-sm text-muted-foreground">
            Нет активных задач. Выберите лист и нажмите Запустить.
          </p>
        </CardContent>
      </Card>
    )
  }

  const config = statusConfig[job.status] || statusConfig.pending
  const progress =
    job.total_rows > 0
      ? Math.round((job.processed_rows / job.total_rows) * 100)
      : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Статус задачи</h3>
        </div>
        <Badge variant={config.variant}>{config.label}</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="text-foreground">
              {job.processed_rows} / {job.total_rows} строк ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Строки</p>
              <p className="text-sm font-medium text-foreground">{job.processed_rows}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Телефоны</p>
              <p className="text-sm font-medium text-foreground">{job.found_phones}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Лист</p>
              <p className="text-sm font-medium text-foreground">{job.sheet_name}</p>
            </div>
          </div>
        </div>

        {job.error_message && (
          <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
            {job.error_message}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
