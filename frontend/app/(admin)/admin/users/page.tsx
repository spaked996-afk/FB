import { UsersTable } from "@/components/admin/users-table"

export default function AdminUsersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Пользователи</h1>
        <p className="text-sm text-muted-foreground">
          Управление учётными записями и правами доступа
        </p>
      </div>

      <UsersTable />
    </div>
  )
}
