import { eq } from "drizzle-orm";
import { layouts } from "~/db/schema";
import type { createDb } from "~/db";
import { updateClasses, updateTailwind } from "~/features/html-classes/services/classes.server";

type Database = ReturnType<typeof createDb>;

export type LayoutInput = {
  name: string;
  body: string;
};

export async function createLayout(db: Database, data: LayoutInput) {
  const now = new Date();

  const id = crypto.randomUUID()

  await db.insert(layouts).values({
    id: id,
    name: data.name,
    body: data.body,
    createdAt: now,
    updatedAt: now,
  });

  await updateClasses(db, { recordType: "layouts", recordId: id, html: data.body })
  await updateTailwind(db)

}

export async function updateLayout(
  db: Database,
  id: string,
  data: LayoutInput,
) {
  const now = new Date();
  await db
    .update(layouts)
    .set({
      name: data.name,
      body: data.body,
      updatedAt: now,
    })
    .where(eq(layouts.id, id));

  await updateClasses(db, { recordType: "layouts", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function deleteLayout(db: Database, id: string) {
  await db.delete(layouts).where(eq(layouts.id, id));
  await updateTailwind(db)
}