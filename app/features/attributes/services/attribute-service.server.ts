import { eq } from "drizzle-orm";
import { attributes } from "~/db/schema";
import type { createDb } from "~/db";

type Database = ReturnType<typeof createDb>;

export type AttributeInput = {
  valueType: string
  layoutId: string
};

export async function createAttribute(db: Database, data: AttributeInput) {
  const now = new Date();

  const id = crypto.randomUUID()

  await db.insert(attributes).values({
    id: id,
    valueType: data.valueType,
    layoutId: data.layoutId,
    createdAt: now,
    updatedAt: now,
  });


}

export async function updateAttribute(
  db: Database,
  id: string,
  data: AttributeInput,
) {
  const now = new Date();
  await db
    .update(attributes)
    .set({
      valueType: data.valueType,
      layoutId: data.layoutId,
      updatedAt: now,
    })
    .where(eq(attributes.id, id));

}

export async function deleteAttribute(db: Database, id: string) {
  await db.delete(attributes).where(eq(attributes.id, id));
}