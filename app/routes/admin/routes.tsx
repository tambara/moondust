import { Link, useNavigate } from "react-router";
import { createDb } from "~/db";
import { routes, pages } from "~/db/schema";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { cloudflareContext } from "../../../workers/app";
import { requireUser } from "~/lib/auth-guard.server";
import { useState } from "react";
import { ResourceList } from "~/features/admin/components/resource-list";
import type { Route } from "./+types/routes";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const result = await db.select().from(routes);
  const session = await requireUser(request, env);

  return {
    directories: result,
  };
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
          items={loaderData.directories}
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

