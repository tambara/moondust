import { createDb } from "~/db";
import * as schema from "~/db/schema";
import type { Route } from "./+types/import";
import { cloudflareContext } from "../../../workers/app";
import { Form } from "react-router";

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    throw new Response("File not found", { status: 400 });
  }

  const data = JSON.parse(await file.text());
function convertTimestamps(rows: any[]) {
  return rows.map((row) => ({
    ...row,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  }));
}

  // 外部キーの依存関係を考慮した順番
  await db.batch([
    db.delete(schema.attributeValues),
    db.delete(schema.routes),
    db.delete(schema.attributes),
    db.delete(schema.pages),
    db.delete(schema.layouts),
    // db.delete(schema.user),

db.insert(schema.layouts).values(convertTimestamps(data.layouts)),
db.insert(schema.pages).values(convertTimestamps(data.pages)),
db.insert(schema.attributes).values(convertTimestamps(data.attributes)),
// db.insert(schema.user).values(convertTimestamps(data.users)),
db.insert(schema.routes).values(convertTimestamps(data.routes)),
db.insert(schema.attributeValues).values(convertTimestamps(data.attributeValues)),
  ]);

  return { success: true };
}
export default function Import({ loaderData }: Route.ComponentProps) {

  return <>
    <Form method="post" encType="multipart/form-data" >
      <input
        type="file"
        name="file"
        accept="application/json"
        required
      />

      <button type="submit" >
        インポート
      </button>
    </Form>
  </>
}