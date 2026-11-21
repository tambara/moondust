import { useNavigate } from "react-router";
import {  type AppType } from "../../../workers/app";
import { useState } from "react";
import { ResourceList } from "~/features/admin/components/resource-list";
import type { Route } from "./+types/routes";
import { hc } from "hono/client";

export async function loader({ request, context }: Route.LoaderArgs) {
  const app = hc<AppType>(new URL(request.url).origin);
  const res = await app.api.routes.$get();
  return await res.json();
}

export default function Pages({ loaderData }: Route.ComponentProps) {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function handleDelete(item: any) {

  }
  return <>
      <section className="space-y-4">
        <ResourceList
          title="ディレクトリ一覧"
          items={loaderData.routes}
          getId={(user) => user.id}
          renderItem={(user) => (
            <>
              <p className="font-medium">{user.slug}</p>
              <p className="truncate text-sm text-muted-foreground">
                {"user.description"}
              </p>
            </>
          )}
          searchPlaceholder="ディレクトリを検索..."
          emptyMessage="ディレクトリがありません"
          onSearch={setSearch}
        onNew={() => `/admin/directories/new`}
        onEdit={(page) => `/admin/routes/${page.id}/edit`}
          onDelete={handleDelete}
        />
      </section>
  </>
}

