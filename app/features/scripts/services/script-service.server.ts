import { eq } from "drizzle-orm";
import {  scripts } from "~/db/schema";
import type { createDb } from "~/db";
import { updateClasses, updateTailwind } from "~/features/html-classes/services/classes.server";

type Database = ReturnType<typeof createDb>;

export type ScriptInput = {
  name: string;
  body: string;
};

export async function createScript(db: Database, data: ScriptInput) {
  const id = crypto.randomUUID()
  await db.insert(scripts).values({
    id: id,
    name: data.name,
    body: data.body,
  });

  await updateClasses(db, { recordType: "scripts", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function updateScript(
  db: Database,
  id: string,
  data: ScriptInput,
) {
  await db
    .update(scripts)
    .set({
      name: data.name,
      body: data.body,
    })
    .where(eq(scripts.id, id));

  await updateClasses(db, { recordType: "scripts", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function deleteScript(db: Database, id: string) {
  await db.delete(scripts).where(eq(scripts.id, id));

  await updateTailwind(db)
}
