import { eq } from "drizzle-orm";
import {  pages } from "~/db/schema";
import type { createDb } from "~/db";
import  { updateClasses, updateTailwind } from "~/features/html-classes/services/classes.server";

type Database = ReturnType<typeof createDb>;

export type PageInput = {
  title: string;
  slug: string;
  body: string;
  layoutId?: string;
};

export async function createPage(db: Database, data: PageInput) {
  const now = Date.now();

  const id = crypto.randomUUID()
  await db.insert(pages).values({
    id: id,
    title: data.title,
    slug: data.slug,
    body: data.body,
    layoutId: data.layoutId,
    createdAt: now,
    updatedAt: now,
  });

  await updateClasses(db, { recordType: "pages", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function updatePage(
  db: Database,
  id: string,
  data: PageInput,
) {
  await db
    .update(pages)
    .set({
      title: data.title,
      slug: data.slug,
      body: data.body,
      layoutId: data.layoutId,
      updatedAt: Date.now(),
    })
    .where(eq(pages.id, id));

  await updateClasses(db, { recordType: "pages", recordId: id, html: data.body })
  await updateTailwind(db)
}

export async function deletePage(db: Database, id: string) {
  await db.delete(pages).where(eq(pages.id, id));

  await updateTailwind(db)
}
