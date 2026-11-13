import {  Link } from "react-router";
import { createDb } from "~/db";
import { scripts } from "~/db/schema";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
} from "~/components/ui/card";
import { cloudflareContext } from "../../../workers/app";
import { requireUser } from "~/lib/auth-guard.server";
import type { Route } from "./+types/scripts";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const result = await db.select().from(scripts);
  const session = await requireUser(request, env);

  return { scripts: result,
 };
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <>
<main className="mx-auto max-w-3xl space-y-8 p-6">
  <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">スクリプト管理</h1>
        <Button >
          <Link to="/admin/scripts/new">新規作成</Link>
        </Button>
      </div>

    <Card>
      <CardContent className="pt-6">
        <ul className="divide-y">
          {loaderData.scripts.map((script) => (
            <li key={script.id} className="py-3">
                {script.name}
      <Link to={`/admin/scripts/${script.id}/edit`}>
  編集
</Link>      </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </section>
</main>
</>
}

