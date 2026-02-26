"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Plus, Pencil, Trash2, UserCheck, UserX, Users } from "lucide-react"
import { toast } from "sonner"
import type { UserInfo } from "@/lib/types"

const initialUsers: UserInfo[] = [
  {
    username: "admin",
    role: "admin",
    is_active: true,
    created_at: "2025-01-15T10:00:00Z",
  },
  {
    username: "client_a",
    role: "client",
    client_id: "client_a",
    is_active: true,
    created_at: "2025-02-01T08:30:00Z",
  },
  {
    username: "client_b",
    role: "client",
    client_id: "client_b",
    is_active: true,
    created_at: "2025-02-15T14:00:00Z",
  },
  {
    username: "client_c",
    role: "client",
    client_id: "client_c",
    is_active: false,
    created_at: "2025-03-01T12:00:00Z",
  },
]

interface NewUserForm {
  username: string
  password: string
  role: "admin" | "client"
  client_id: string
}

export function UsersTable() {
  const [users, setUsers] = useState<UserInfo[]>(initialUsers)
  const [newUser, setNewUser] = useState<NewUserForm>({
    username: "",
    password: "",
    role: "client",
    client_id: "",
  })
  const [editUser, setEditUser] = useState<UserInfo | null>(null)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  function handleAddUser() {
    if (!newUser.username || !newUser.password) {
      toast.error("Заполните все обязательные поля")
      return
    }

    if (users.some((u) => u.username === newUser.username)) {
      toast.error("Пользователь с таким именем уже существует")
      return
    }

    const user: UserInfo = {
      username: newUser.username,
      role: newUser.role,
      client_id: newUser.role === "client" ? newUser.client_id || newUser.username : undefined,
      is_active: true,
      created_at: new Date().toISOString(),
    }

    setUsers([...users, user])
    setNewUser({ username: "", password: "", role: "client", client_id: "" })
    setAddDialogOpen(false)
    toast.success(`Пользователь "${user.username}" создан`)
  }

  function handleToggleActive(username: string) {
    setUsers(
      users.map((u) =>
        u.username === username ? { ...u, is_active: !u.is_active } : u
      )
    )
    const user = users.find((u) => u.username === username)
    toast.success(
      `Пользователь "${username}" ${user?.is_active ? "заблокирован" : "разблокирован"}`
    )
  }

  function handleDeleteUser(username: string) {
    setUsers(users.filter((u) => u.username !== username))
    toast.success(`Пользователь "${username}" удалён`)
  }

  function handleEditSave() {
    if (!editUser) return
    setUsers(
      users.map((u) =>
        u.username === editUser.username ? editUser : u
      )
    )
    setEditDialogOpen(false)
    setEditUser(null)
    toast.success("Данные пользователя обновлены")
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-primary" />
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Управление пользователями
            </h3>
            <p className="text-sm text-muted-foreground">
              {users.length} пользователей
            </p>
          </div>
        </div>

        <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="mr-2 h-4 w-4" />
              Добавить
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Новый пользователь</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-username">Имя пользователя</Label>
                <Input
                  id="new-username"
                  value={newUser.username}
                  onChange={(e) =>
                    setNewUser({ ...newUser, username: e.target.value })
                  }
                  placeholder="username"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">Пароль</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newUser.password}
                  onChange={(e) =>
                    setNewUser({ ...newUser, password: e.target.value })
                  }
                  placeholder="password"
                />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(v) =>
                    setNewUser({ ...newUser, role: v as "admin" | "client" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Клиент</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {newUser.role === "client" && (
                <div className="space-y-2">
                  <Label htmlFor="new-client-id">ID клиента</Label>
                  <Input
                    id="new-client-id"
                    value={newUser.client_id}
                    onChange={(e) =>
                      setNewUser({ ...newUser, client_id: e.target.value })
                    }
                    placeholder="client_id"
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Отмена</Button>
              </DialogClose>
              <Button onClick={handleAddUser}>Создать</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardHeader>

      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Пользователь</TableHead>
              <TableHead>Роль</TableHead>
              <TableHead>ID клиента</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead>Создан</TableHead>
              <TableHead className="text-right">Действия</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.username}>
                <TableCell className="font-medium text-foreground">
                  {user.username}
                </TableCell>
                <TableCell>
                  <Badge variant={user.role === "admin" ? "default" : "secondary"}>
                    {user.role === "admin" ? "Админ" : "Клиент"}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {user.client_id || "--"}
                </TableCell>
                <TableCell>
                  {user.is_active ? (
                    <Badge variant="outline" className="border-success text-success">
                      Активен
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-destructive text-destructive">
                      Заблокирован
                    </Badge>
                  )}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {new Date(user.created_at).toLocaleDateString("ru-RU")}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => {
                        setEditUser({ ...user })
                        setEditDialogOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                      <span className="sr-only">Редактировать</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleToggleActive(user.username)}
                    >
                      {user.is_active ? (
                        <UserX className="h-4 w-4 text-destructive" />
                      ) : (
                        <UserCheck className="h-4 w-4 text-success" />
                      )}
                      <span className="sr-only">
                        {user.is_active ? "Заблокировать" : "Разблокировать"}
                      </span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                          <span className="sr-only">Удалить</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Удалить пользователя?
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Вы уверены, что хотите удалить пользователя{" "}
                            <strong>{user.username}</strong>? Это действие
                            нельзя отменить.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Отмена</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteUser(user.username)}
                          >
                            Удалить
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Редактирование пользователя</DialogTitle>
          </DialogHeader>
          {editUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Имя пользователя</Label>
                <Input value={editUser.username} disabled />
              </div>
              <div className="space-y-2">
                <Label>Роль</Label>
                <Select
                  value={editUser.role}
                  onValueChange={(v) =>
                    setEditUser({
                      ...editUser,
                      role: v as "admin" | "client",
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client">Клиент</SelectItem>
                    <SelectItem value="admin">Администратор</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {editUser.role === "client" && (
                <div className="space-y-2">
                  <Label>ID клиента</Label>
                  <Input
                    value={editUser.client_id || ""}
                    onChange={(e) =>
                      setEditUser({
                        ...editUser,
                        client_id: e.target.value,
                      })
                    }
                  />
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Отмена</Button>
            </DialogClose>
            <Button onClick={handleEditSave}>Сохранить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
