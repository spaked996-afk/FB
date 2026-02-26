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
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Users } from "lucide-react"
import type { AdminClientRow } from "@/lib/types"

interface ClientsTableProps {
  clients: AdminClientRow[]
  isLoading: boolean
}

export function ClientsTable({ clients, isLoading }: ClientsTableProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center gap-2 pb-4">
        <Users className="h-5 w-5 text-primary" />
        <div>
          <h3 className="text-lg font-semibold text-foreground">Клиенты</h3>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        ) : clients.length === 0 ? (
          <p className="py-8 text-center text-muted-foreground">
            Клиенты не найдены
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Пользователь</TableHead>
                <TableHead>ID клиента</TableHead>
                <TableHead>Статус</TableHead>
                <TableHead>Прогресс</TableHead>
                <TableHead className="text-right">За период</TableHead>
                <TableHead className="text-right">Долг</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => {
                const isRunning = client.running

                return (
                  <TableRow key={client.client_id}>
                    <TableCell className="font-medium text-foreground">
                      {client.username}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {client.client_id}
                    </TableCell>
                    <TableCell>
                      {isRunning ? (
                        <Badge variant="default">Выполняется</Badge>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Простой
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      {isRunning ? (
                        <div className="flex items-center gap-2">
                          <Progress value={client.progress} className="h-2 w-20" />
                          <span className="text-xs text-muted-foreground">
                            {client.progress}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          --
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-foreground">
                      {client.current_period.toLocaleString("ru-RU")} руб
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        client.debt > 0
                          ? "text-destructive"
                          : "text-success"
                      }`}
                    >
                      {client.debt.toLocaleString("ru-RU")} руб
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  )
}
