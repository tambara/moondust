import { eq } from "drizzle-orm";
import { attributes, layouts, valueTypes } from "~/db/schema";
import type { createDb } from "~/db";
import { updateClasses, updateTailwind } from "~/features/html-classes/services/classes.server";
import type { Layout } from "../schemas/layout-schema";

type Database = ReturnType<typeof createDb>;

export async function createLayout(db: Database, data: Layout) {
  const now = new Date();

  const id = crypto.randomUUID()

  await db.batch([
    db.insert(layouts).values({
      id: id,
      name: data.name,
      body: data.body,
      createdAt: now,
      updatedAt: now,
    }),
    db.insert(attributes).values(
      data.attributes.map((attribute) => ({
        id: crypto.randomUUID(),
        layoutId: id,
        name: attribute.name,
        valueType: attribute.valueType,
      }))
    ),
  ]);

  await updateClasses(db, { recordType: "layouts", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function updateLayout(
  db: Database,
  id: string,
  data: Layout,
) {
  const now = new Date();
  await db.batch([
    db
      .update(layouts)
      .set({
        name: data.name,
        body: data.body,
        updatedAt: now,
      })
      .where(eq(layouts.id, id)),
    db
      .delete(attributes)
      .where(eq(attributes.layoutId, id)),
    db.insert(attributes).values(
      data.attributes.map((attribute) => ({
        id: crypto.randomUUID(),
        layoutId: id,
        name: attribute.name,
        valueType: attribute.valueType,
      }))
    ),
  ]);
  await updateClasses(db, { recordType: "layouts", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function deleteLayout(db: Database, id: string) {
  await db.delete(layouts).where(eq(layouts.id, id));
  await updateTailwind(db)
}

export async function getLayoutsWithAttributes(db: Database) {
  return await db.query.layouts.findMany({
    with: {
      attributes: true,
    },
  });
}
export async function getLayoutWithAttributes(db: Database, layoutId: string) {
  return await db.query.layouts.findFirst({
    where: eq(layouts.id, layoutId),
    with: {
      attributes: true,
    },
  });
}