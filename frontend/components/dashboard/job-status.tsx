"use client"

import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Activity, Phone, Hash } from "lucide-react"
import type { ActiveJobResponse } from "@/lib/types"

interface JobStatusProps {
  job: ActiveJobResponse | null
  isLoading: boolean
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

  if (!job || job.status === "idle" || !job.job_id) {
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

  const progress =
    job.progress_total > 0
      ? Math.round((job.progress_current / job.progress_total) * 100)
      : 0

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Статус задачи</h3>
        </div>
        <Badge variant="default">Выполняется</Badge>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="mb-1 flex justify-between text-sm">
            <span className="text-muted-foreground">Прогресс</span>
            <span className="text-foreground">
              {job.progress_current} / {job.progress_total} строк ({progress}%)
            </span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Обработано</p>
              <p className="text-sm font-medium text-foreground">{job.progress_current}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Найдено телефонов</p>
              <p className="text-sm font-medium text-foreground">{job.found}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
