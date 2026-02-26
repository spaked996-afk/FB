"use client"

import { useState } from "react"
import { useSession } from "@/hooks/use-session"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { UserCircle, Key, Shield, Loader2 } from "lucide-react"
import { toast } from "sonner"

export default function ProfilePage() {
  const { session, isLoading } = useSession()
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [saving, setSaving] = useState(false)

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast.error("Пароли не совпадают")
      return
    }

    if (newPassword.length < 6) {
      toast.error("Пароль должен быть не менее 6 символов")
      return
    }

    setSaving(true)
    // Мок -- API пока нет
    await new Promise((r) => setTimeout(r, 1000))
    toast.success("Пароль изменён (демо)")
    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Профиль</h1>
        <p className="text-sm text-muted-foreground">
          Информация об аккаунте и настройки
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <UserCircle className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Данные аккаунта
            </h3>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                {session?.username?.charAt(0).toUpperCase() || "?"}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  {session?.username}
                </p>
                <Badge variant="secondary">
                  {session?.role === "admin" ? "Администратор" : "Клиент"}
                </Badge>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">
                  Имя пользователя
                </span>
                <span className="text-sm font-medium text-foreground">
                  {session?.username}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Роль</span>
                <span className="text-sm font-medium text-foreground">
                  {session?.role === "admin" ? "Администратор" : "Клиент"}
                </span>
              </div>
              {session?.clientId && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">
                    ID клиента
                  </span>
                  <span className="text-sm font-medium text-foreground font-mono">
                    {session.clientId}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center gap-2 pb-4">
            <Key className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground">
              Изменить пароль
            </h3>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleChangePassword} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Текущий пароль</Label>
                <Input
                  id="current-password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Новый пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Подтвердите пароль</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Сохранение...
                  </>
                ) : (
                  "Сохранить пароль"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center gap-2 pb-4">
          <Shield className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-semibold text-foreground">
            Безопасность
          </h3>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Активные сессии
                </p>
                <p className="text-xs text-muted-foreground">
                  Текущая сессия активна
                </p>
              </div>
              <Badge variant="outline" className="border-success text-success">
                Активна
              </Badge>
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Двухфакторная аутентификация
                </p>
                <p className="text-xs text-muted-foreground">
                  Дополнительный уровень защиты
                </p>
              </div>
              <Badge variant="outline" className="border-muted-foreground text-muted-foreground">
                Не настроена
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
