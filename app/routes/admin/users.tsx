import {  useNavigate } from "react-router";
import type { Route } from "./+types/users";
import { createAuth } from "~/lib/auth.server";
import { cloudflareContext } from "../../../workers/app";
import { ResourceList } from "~/features/admin/components/resource-list";
import { useState } from "react";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const auth = createAuth(env);

  const result = await auth.api.listUsers({
    query: {
      limit: 100,
      sortBy: "createdAt",
      sortDirection: "desc",
    },
    headers: request.headers,
  });

    const { requireAdmin } = await import(
    "~/lib/auth-guard.server"
  );

  const currentUser = await requireAdmin(request, env);

  return { users: result.users, currentUser: currentUser };

}

export default function Users({ loaderData }: Route.ComponentProps) {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function handleDelete(item: any) {

  }
  return <>
    <section className="space-y-4">
      <ResourceList
        title="ユーザー一覧"
        items={loaderData?.users || []}
        getId={(user) => user.id}
        renderItem={(user) => (
          <>
            <p className="font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.email}
            </p>
            <p className="text-xs text-muted-foreground">
              権限：{user.role ?? "user"}
              {user.id === loaderData?.currentUser?.session.id && "（自分）"}
            </p>
          </>
        )}
        searchPlaceholder="ユーザーを検索..."
        emptyMessage="ユーザーがありません"
        onSearch={setSearch}
        onNew={() => `/admin/users/new`}
        onEdit={(page) => `/admin/users/${page.id}/edit`}
        onDelete={handleDelete}
      />
    </section>
  </>
}

