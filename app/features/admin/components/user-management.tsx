
import { useCallback, useState, type FormEvent } from "react";
import { authClient } from "~/lib/auth-client";
import type { UserWithRole } from "better-auth/plugins";
import { CrudManager } from "./crud-manager";
import  { Button } from "@base-ui/react/button";
import  { Input } from "@base-ui/react/input";
import  { Label } from "~/components/ui/label";

type UserRole = "user" | "admin";

type CreateUserData = {
  name: string;
  email: string;
  password: string;
};

type UpdateUserData = {
  name: string;
  email: string;
  role: UserRole;
};

export function UserManagement({
  currentUserId,
}: {
  currentUserId: string;
}) {
  const loadUsers = useCallback(async (search: string) => {
    const result = await authClient.admin.listUsers({
      query: {
        limit: 100,
        sortBy: "createdAt",
        sortDirection: "desc",
        ...(search
          ? {
              searchValue: search,
              searchField: "email",
              searchOperator: "contains" as const,
            }
          : {}),
      },
    });

    if (result.error) throw new Error(result.error.message);

    return result.data?.users ?? [];
  }, []);

  async function createUser(data: CreateUserData) {
    const result = await authClient.admin.createUser({
      ...data,
      role: "user",
    });

    if (result.error) throw new Error(result.error.message);
  }

  async function updateUser(id: string, data: UpdateUserData) {
    const result = await authClient.admin.updateUser({
      userId: id,
      data: {
        name: data.name,
        email: data.email,
      },
    });

    if (result.error) throw new Error(result.error.message);

    if (id !== currentUserId) {
      const roleResult = await authClient.admin.setRole({
        userId: id,
        role: data.role,
      });

      if (roleResult.error) {
        throw new Error(roleResult.error.message);
      }
    }
  }

  async function deleteUser(user: UserWithRole) {
    if (user.id === currentUserId) {
      throw new Error("自分自身は削除できません。");
    }

    const result = await authClient.admin.removeUser({
      userId: user.id,
    });

    if (result.error) throw new Error(result.error.message);
  }

  return (
    <CrudManager<UserWithRole, CreateUserData, UpdateUserData>
      title="ユーザー一覧"
      createTitle="ユーザー追加"
      editTitle="ユーザー編集"
      getId={(user) => user.id}
      loadItems={loadUsers}
      createItem={createUser}
      updateItem={updateUser}
      deleteItem={deleteUser}
      searchPlaceholder="メールアドレスで検索"
      emptyMessage="ユーザーがいません。"
      confirmDelete={(user) =>
        user.id !== currentUserId &&
        window.confirm(`${user.name} (${user.email}) を削除しますか？`)
      }
      renderItem={(user) => (
        <>
          <p className="font-medium">{user.name}</p>
          <p className="truncate text-sm text-muted-foreground">
            {user.email}
          </p>
          <p className="text-xs text-muted-foreground">
            権限：{user.role ?? "user"}
            {user.id === currentUserId && "（自分）"}
          </p>
        </>
      )}
      renderCreateForm={({ onSubmit, loading }) => (
        <UserCreateForm onSubmit={onSubmit} loading={loading} />
      )}
      renderEditForm={({ item, onSubmit, onCancel, loading }) => (
        <UserEditForm
          user={item}
          currentUserId={currentUserId}
          onSubmit={onSubmit}
          onCancel={onCancel}
          loading={loading}
        />
      )}
    />
  );
}


export function UserCreateForm({ onSubmit, loading }: {
  onSubmit: (data: CreateUserData) => Promise<void>;
  loading: boolean;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    await onSubmit({ name, email, password });

    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
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
        <Button type="submit" disabled={loading}>
          ユーザーを追加
        </Button>
      </div>
    </form>
  );
}

export function UserEditForm({
  user,
  currentUserId,
  onSubmit,
  onCancel,
  loading,
}: {
  user: UserWithRole;
  currentUserId: string;
  onSubmit: (data: UpdateUserData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
}) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(
    user.role === "admin" ? "admin" : "user",
  );

  const isSelf = user.id === currentUserId;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    await onSubmit({ name, email, role });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-name">名前</Label>
        <Input
          id="edit-name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-email">メールアドレス</Label>
        <Input
          id="edit-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-role">権限</Label>
        <select
          id="edit-role"
          className="h-9 w-full rounded-md border bg-transparent px-3 text-sm"
          value={role}
          disabled={isSelf || loading}
          onChange={(e) =>
            setRole(e.target.value === "admin" ? "admin" : "user")
          }
        >
          <option value="user">一般ユーザー</option>
          <option value="admin">管理者</option>
        </select>

        {isSelf && (
          <p className="text-xs text-muted-foreground">
            自分自身の権限は変更できません。
          </p>
        )}
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={loading}>
          保存
        </Button>
        <Button
          type="button"
          onClick={onCancel}
          disabled={loading}
        >
          キャンセル
        </Button>
      </div>
    </form>
  );
}
