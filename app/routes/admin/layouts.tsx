
import { useNavigate } from "react-router";

import { type AppType } from "../../../workers/app";
import type { Route } from "./+types/layouts";
import { useState } from "react";
import { ResourceList } from "~/features/admin/components/resource-list";
import { hc } from "hono/client";

export async function loader({ request }: Route.LoaderArgs) {
  const app = hc<AppType>(new URL(request.url).origin);
  const res = await app.api.layouts.$get();
  return await res.json();
}

export default function Layouts({ loaderData }: Route.ComponentProps) {
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function handleDelete(item: any) {

  }
  return <>
    <section className="space-y-4">

      <ResourceList
        title="レイアウト一覧"
        items={loaderData.layouts}
        getId={(user) => user.id}
        renderItem={(user) => (
          <>
            <p className="font-medium">{user.name}</p>
            <p className="truncate text-sm text-muted-foreground">
              {user.id}
            </p>
          </>
        )}
        searchPlaceholder="レイアウトを検索..."
        emptyMessage="レイアウトがありません"
        onSearch={setSearch}
        onNew={() => `/admin/layouts/new`}
        onEdit={(page) => `/admin/layouts/${page.id}/edit`}
        onDelete={handleDelete}
      />
    </section>
  </>
}

