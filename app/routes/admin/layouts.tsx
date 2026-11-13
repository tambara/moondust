
import { Link, useLoaderData } from "react-router";
import { eq } from "drizzle-orm";
import { createDb } from "~/db";

import { layouts } from "~/db/schema";
import { requireAdmin } from "~/lib/auth-guard.server";
import { Button } from "~/components/ui/button";
import { cloudflareContext } from "../../../workers/app";
import type { Route } from "./+types/layouts";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  await requireAdmin(request, env);

  const db = createDb(env.pages);
  const items = await db.select().from(layouts);

  return { layouts: items };
}

export default function LayoutsPage() {
  const { layouts } = useLoaderData<typeof loader>();

  return (
  <main className="mx-auto max-w-3xl space-y-8 p-6">
  <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Layout管理</h1>
        <Button >
          <Link to="/admin/layouts/new">新規作成</Link>
        </Button>
      </div>

      <div className="divide-y rounded-lg border">
        {layouts.map((layout) => (
          <div key={layout.id} className="flex items-center justify-between p-4">
            <span>{layout.name}</span>
            <Button variant="outline" size="sm" >
              <Link to={`/admin/layouts/${layout.id}/edit`}>
                編集
              </Link>
            </Button>
          </div>
        ))}

        {layouts.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">
            Layoutはまだ登録されていません。
          </p>
        )}
      </div>
    </div>
    </main>
  );
}
