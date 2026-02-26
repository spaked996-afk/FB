"use client"

import { useRef, useEffect } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Terminal } from "lucide-react"
import type { LogEntry } from "@/lib/types"

interface JobLogsProps {
  logs: LogEntry[]
  isLoading: boolean
}

function getLogColor(level: string): string {
  switch (level) {
    case "success":
      return "text-success"
    case "error":
      return "text-destructive"
    case "warning":
      return "text-warning"
    case "cache":
      return "text-primary"
    default:
      return "text-muted-foreground"
  }
}

function getLogPrefix(level: string): string {
  switch (level) {
    case "success":
      return "[OK]"
    case "error":
      return "[ERR]"
    case "warning":
      return "[WARN]"
    case "cache":
      return "[CACHE]"
    default:
      return "[INFO]"
  }
}

export function JobLogs({ logs, isLoading }: JobLogsProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [logs.length])

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Terminal className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">Логи</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {logs.length} записей
        </span>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-64 rounded-lg bg-secondary p-4">
          <div className="space-y-1 font-mono text-xs">
            {isLoading && logs.length === 0 && (
              <p className="text-muted-foreground">{"Ожидание логов..."}</p>
            )}
            {!isLoading && logs.length === 0 && (
              <p className="text-muted-foreground">{"Нет логов. Запустите задачу."}</p>
            )}
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="shrink-0 text-muted-foreground">
                  {log.timestamp}
                </span>
                <span className={`shrink-0 ${getLogColor(log.level)}`}>
                  {getLogPrefix(log.level)}
                </span>
                <span className="text-foreground">{log.message}</span>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
