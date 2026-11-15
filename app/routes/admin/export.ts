import { createDb } from "~/db";
import * as schema from "~/db/schema";
import type { Route } from "./+types/export";
import { cloudflareContext } from "../../../workers/app";

export async function loader({ context }: Route.LoaderArgs) {
   const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const [
    pages,
    layouts,
    users,
  ] = await Promise.all([
    db.select().from(schema.pages),
    db.select().from(schema.layouts),
    db.select().from(schema.user),
  ]);

  const data = {
    exportedAt: new Date().toISOString(),
    pages,
    layouts,
    users,
  };

  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": 'attachment; filename="database.json"',
    },
  });
}