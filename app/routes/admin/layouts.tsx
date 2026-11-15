
import { Link, useLoaderData, useNavigate } from "react-router";
import { eq } from "drizzle-orm";
import { createDb } from "~/db";

import { layouts } from "~/db/schema";
import { requireAdmin } from "~/lib/auth-guard.server";
import { Button } from "~/components/ui/button";
import { cloudflareContext } from "../../../workers/app";
import type { Route } from "./+types/layouts";
import { useState } from "react";
import { ResourceList } from "~/features/admin/components/resource-list";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireAdmin(request, env);

  const db = createDb(env.pages);
  const items = await db.select().from(layouts);

  return { layouts: items };
}


export default function Layouts({ loaderData }: Route.ComponentProps) {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function handleDelete(item: any) {

  }
  return <>
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">レイアウト管理</h1>
          <Button >
            <Link to="/admin/layouts/new">新規作成</Link>
          </Button>
        </div>
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
          onEdit={(page) => navigate(`/admin/layouts/${page.id}/edit`)}
          onDelete={handleDelete}
        />
      </section>
  </>
}

