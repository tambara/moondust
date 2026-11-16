import { and, desc, eq, notInArray, sql } from "drizzle-orm";
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
      contentType: data.contentType,
      createdAt: now,
      updatedAt: now,
    }),
    ...(data.attributes.length ? [db.insert(attributes).values(
      data.attributes.map((attribute) => ({
        id: crypto.randomUUID(),
        layoutId: id,
        label: attribute.label,
        name: attribute.name,
        description: attribute.description ?? "",
        position: attribute.position,
        valueType: attribute.valueType,
      }))
    )] : []),
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

  const deleteAttributeIds = data.attributes.map((attribute) => attribute.id).filter((v): v is string => v != null)
  console.log("data.attributesdata.attributesdata.attributes")
  console.log(data.attributes.length)
  console.log(data.attributes)
  await db.batch([
    db
      .update(layouts)
      .set({
        name: data.name,
        contentType: data.contentType,
        body: data.body,
        updatedAt: now,
      })
      .where(eq(layouts.id, id)),
    // TODO: attributeValueの削除
    ...(deleteAttributeIds.length ? [db
      .delete(attributes)
      .where(and(
        eq(attributes.layoutId, id),
        notInArray(attributes.id, deleteAttributeIds),
      ),
      )] : [db
        .delete(attributes)
        .where(and(
          eq(attributes.layoutId, id),
        ),
        )]),

    // db.insert(attributes).values(
    //   data.attributes.map((attribute) => ({
    //     id: crypto.randomUUID(),
    //     layoutId: id,
    //     name: attribute.name,
    //     valueType: attribute.valueType,
    //   }))
    // ),
    ...(data.attributes.length ?
      [
        db.insert(attributes)
          .values(data.attributes.map((attribute) => {
            return {
              id: attribute.id ?? crypto.randomUUID(),
              layoutId: id,
              position: attribute.position,
              label: attribute.label,
              description: attribute.description ?? "",
              name: attribute.name,
              valueType: attribute.valueType,
            }
          })
          )
          .onConflictDoUpdate({
            target: [
              attributes.layoutId,
              attributes.name
            ],
            set: {
              name: sql`excluded.name`,
              position: sql`excluded.position`,
              label: sql`excluded.label`,
              description: sql`excluded.description`,
              valueType: sql`excluded.value_type`,
            },
            setWhere: eq(attributes.layoutId, id),
          })
      ] : [])
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