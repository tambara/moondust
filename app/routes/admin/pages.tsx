import { Link, useNavigate } from "react-router";
import { createDb } from "~/db";
import { pages } from "~/db/schema";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { cloudflareContext } from "../../../workers/app";
import { requireUser } from "~/lib/auth-guard.server";
import type { Route } from "./+types/pages";
import { useState } from "react";
import { ResourceList } from "~/features/admin/components/resource-list";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const result = await db.select().from(pages);
  const session = await requireUser(request, env);

  return {
    pages: result,
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
          title="ページ一覧"
          items={loaderData.pages}
          getId={(user) => user.id}
          renderItem={(user) => (
            <>
              <p className="font-medium">{user.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {user.slug}
              </p>
            </>
          )}
          searchPlaceholder="ページを検索..."
          emptyMessage="ペ０時がありません"
          onSearch={setSearch}
        onNew={() => `/admin/pages/new`}
        onEdit={(page) => `/admin/pages/${page.id}/edit`}
          onDelete={handleDelete}
        />
      </section>
  </>
}

