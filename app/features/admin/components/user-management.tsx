import { useEffect, useState, type FormEvent } from "react";

import { authClient } from "~/lib/auth-client";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { UserWithRole } from "better-auth/plugins";
type UserRole = "user" | "admin";

type User = {
  id: string;
  name: string;
  email: string;
  role?: UserRole;
};

type EditingUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export function UserManagement({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<EditingUser | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function loadUsers() {
    setLoading(true);
    setError("");

    const result = await authClient.admin.listUsers({
      query: {
        limit: 100,
        sortBy: "createdAt",
        sortDirection: "desc",
        ...(search
          ? {
              searchValue: search,
              searchField: "email",
              searchOperator: "contains",
            }
          : {}),
      },
    });

    if (result.error) {
      setError(result.error.message ?? "ユーザー一覧を取得できませんでした。");
    } else {
      setUsers(result.data?.users ?? []);
    }

    setLoading(false);
  }

  useEffect(() => {
    void loadUsers();
  }, []);

  async function handleCreate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const result = await authClient.admin.createUser({
      name,
      email,
      password,
      role: "user",
    });

    if (result.error) {
      setError(result.error.message ?? "ユーザーを追加できませんでした。");
      return;
    }

    setName("");
    setEmail("");
    setPassword("");

    await loadUsers();
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!editing) return;

    setError("");

    const result = await authClient.admin.updateUser({
      userId: editing.id,
      data: {
        name: editing.name,
        email: editing.email,
      },
    });

    if (result.error) {
      setError(result.error.message ?? "ユーザー情報を更新できませんでした。");
      return;
    }

    if (editing.id !== currentUserId) {
      const roleResult = await authClient.admin.setRole({
        userId: editing.id,
        role: editing.role,
      });

      if (roleResult.error) {
        setError(roleResult.error.message ?? "権限を更新できませんでした。");
        await loadUsers();
        return;
      }
    }

    setEditing(null);
    await loadUsers();
  }

  async function handleDelete(user: UserWithRole) {
    if (user.id === currentUserId) {
      setError("自分自身は削除できません。");
      return;
    }

    if (!window.confirm(`${user.name} (${user.email}) を削除しますか？`)) {
      return;
    }

    setError("");

    const result = await authClient.admin.removeUser({
      userId: user.id,
    });

    if (result.error) {
      setError(result.error.message ?? "ユーザーを削除できませんでした。");
      return;
    }

    await loadUsers();
  }

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>ユーザー追加</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleCreate} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="new-name">名前</Label>
              <Input
                id="new-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-email">メールアドレス</Label>
              <Input
                id="new-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="new-password">初期パスワード</Label>
              <Input
                id="new-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={8}
                required
              />
            </div>

            <div className="flex items-end">
              <Button type="submit">ユーザーを追加</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>ユーザー一覧</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="メールアドレスで検索"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="outline" onClick={loadUsers}>
              検索
            </Button>
          </div>

          {loading ? (
            <p className="text-sm text-muted-foreground">読み込み中...</p>
          ) : users.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              ユーザーがいません。
            </p>
          ) : (
            <div className="divide-y">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                >
                  <div className="min-w-0">
                    <p className="font-medium">{user.name}</p>
                    <p className="truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      権限：{user.role ?? "user"}
                      {user.id === currentUserId && "（自分）"}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        setEditing({
                          id: user.id,
                          name: user.name,
                          email: user.email,
  role: user.role === "admin" ? "admin" : "user",
                        })
                      }
                    >
                      編集
                    </Button>

                    <Button
                      size="sm"
                      variant="destructive"
                      disabled={user.id === currentUserId}
                      onClick={() => handleDelete(user)}
                    >
                      削除
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {editing && (
        <Card>
          <CardHeader>
            <CardTitle>ユーザー編集</CardTitle>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">名前</Label>
                <Input
                  id="edit-name"
                  value={editing.name}
                  onChange={(e) =>
                    setEditing({ ...editing, name: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-email">メールアドレス</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={editing.email}
                  onChange={(e) =>
                    setEditing({ ...editing, email: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-role">権限</Label>
                <select
                  id="edit-role"
                  className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
                  value={editing.role}
                  disabled={editing.id === currentUserId}
                  onChange={(e) =>
                    setEditing({ ...editing, 
  role: e.target.value === "admin" ? "admin" : "user",
                     })
                  }
                >
                  <option value="user">一般ユーザー</option>
                  <option value="admin">管理者</option>
                </select>
                {editing.id === currentUserId && (
                  <p className="text-xs text-muted-foreground">
                    自分自身の権限は変更できません。
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <Button type="submit">保存</Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(null)}
                >
                  キャンセル
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}