"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Play, Square, Loader2, FileSpreadsheet } from "lucide-react"
import { toast } from "sonner"

interface JobControlsProps {
  sheets: string[]
  clientId: string
  isRunning: boolean
  activeJobId: string | null
  onJobStarted: () => void
  onJobStopped: () => void
}

export function JobControls({
  sheets,
  clientId,
  isRunning,
  activeJobId,
  onJobStarted,
  onJobStopped,
}: JobControlsProps) {
  const [selectedSheet, setSelectedSheet] = useState(sheets[0] || "")
  const [loading, setLoading] = useState(false)

  async function handleStart() {
    if (!selectedSheet) {
      toast.error("Сначала выберите лист")
      return
    }

    setLoading(true)
    try {
      const res = await fetch("/api/proxy/jobs/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: clientId,
          worksheet_name: selectedSheet,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        toast.error(data.error || "Не удалось запустить задачу")
        return
      }

      toast.success(`Задача запущена: "${selectedSheet}"`)
      onJobStarted()
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setLoading(false)
    }
  }

  async function handleStop() {
    if (!activeJobId) {
      toast.error("Нет активной задачи для остановки")
      return
    }

    setLoading(true)
    try {
      const res = await fetch(
        `/api/proxy/jobs/${clientId}/${activeJobId}/stop`,
        { method: "POST" }
      )

      if (!res.ok) {
        toast.error("Не удалось остановить задачу")
        return
      }

      toast.success("Задача остановлена")
      onJobStopped()
    } catch {
      toast.error("Ошибка соединения")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <FileSpreadsheet className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Выбор листа</h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedSheet}
          onValueChange={setSelectedSheet}
          className="space-y-2"
        >
          {sheets.map((sheet) => (
            <div key={sheet} className="flex items-center gap-2">
              <RadioGroupItem value={sheet} id={sheet} />
              <Label htmlFor={sheet} className="text-foreground">{sheet}</Label>
            </div>
          ))}
          {sheets.length === 0 && (
            <p className="text-sm text-muted-foreground">
              Нет доступных листов
            </p>
          )}
        </RadioGroup>

        <div className="flex gap-2">
          <Button onClick={handleStart} disabled={loading || isRunning}>
            {loading && !isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Play className="mr-2 h-4 w-4" />
            )}
            Запустить
          </Button>
          <Button
            variant="destructive"
            onClick={handleStop}
            disabled={loading || !isRunning}
          >
            {loading && isRunning ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Square className="mr-2 h-4 w-4" />
            )}
            Остановить
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
