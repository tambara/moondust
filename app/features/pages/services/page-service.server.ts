import { eq, sql } from "drizzle-orm";
import { attributeValues, pages, valueTypes } from "~/db/schema";
import type { createDb } from "~/db";
import { updateClasses, updateTailwind } from "~/features/html-classes/services/classes.server";
import type { getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";

type Database = ReturnType<typeof createDb>;
export type AttributeValuesInput = {
  id?: string,
  attributeId: string,
  value: string,
};

export type PageInput = {
  title: string;
  slug: string;
  layoutId: string;
  attributes: AttributeValuesInput[]
};

export async function createPage(db: Database, data: PageInput, layout: Awaited<ReturnType<typeof getLayoutWithAttributes>>) {
  const now = Date.now();
  const id = crypto.randomUUID()

  const dataAttributeValues = layout?.attributes?.length ?
    data.attributes.map((attribute) => {
      const layoutAttribute = layout?.attributes.find(e => e.id === attribute.attributeId)
      if (!layoutAttribute) {
        throw Error("")
      }
      const attribureValue = getAttribureValueFrom(
        layoutAttribute.valueType, attribute.value)

      return {
        id: crypto.randomUUID(),
        attributeId: attribute.attributeId,
        pageId: id,
        ...attribureValue
        // layoutId: id,
        // name: attribute.name,
        // valueType: attribute.valueType,
      }
    }) : []

  await db.batch([
    db.insert(pages).values({
      id: id,
      title: data.title,
      slug: data.slug,
      layoutId: data.layoutId,
      createdAt: now,
      updatedAt: now,
    }),
    // db
    //   .delete(attributeValues)
    //   .where(eq(attributes.layoutId, id)),

    ...(dataAttributeValues.length
      ? [
        db.insert(attributeValues).values(
          dataAttributeValues
        ),
      ]
      : []),
  ]);

  const classParseData = data.attributes
    .map(({ value }) => value)
    .join("\n");

  await updateClasses(db, { recordType: "pages", recordId: id, html: classParseData })
  await updateTailwind(db)
}

function getAttribureValueFrom(type: (typeof valueTypes)[number], value: string) {
  switch (type) {
    case "text":
      return { valueText: value }
    case "html":
      return { valueText: value }
    case "markdown":
      return { valueText: value }
    case "number":
      return { valueInteger: Number.parseInt(value) }
  } // valueText: text("value_text"),
  // valueInteger: integer("value_integer"),
  // valueReal: real("value_real"),
  // valueBlob: blob("value_blob"),
  // valueJson: text("value_json"),

}

export async function updatePage(db: Database, id: string, data: PageInput, layout: Awaited<ReturnType<typeof getLayoutWithAttributes>>) {
  const now = Date.now();

  const dataAttributeValues = layout?.attributes?.length ?
    data.attributes.map((attribute) => {
      const layoutAttribute = layout?.attributes.find(e => e.id === attribute.attributeId)
      if (!layoutAttribute) {
        throw Error("")
      }
      const attribureValue = getAttribureValueFrom(
        layoutAttribute.valueType, attribute.value)

      return {
        id: attribute.id ?? crypto.randomUUID(),
        attributeId: attribute.attributeId,
        pageId: id,
        ...attribureValue
        // layoutId: id,
        // name: attribute.name,
        // valueType: attribute.valueType,
      }
    }) : []

  const page = await db.query.pages.findFirst({
    where: eq(pages.id, id),
    with: {
      layout: true,
    },
  });

  if (!page) {
    throw Error("無効なページ")
  }


  await db.batch([
    db
      .update(pages)
      .set({
        title: data.title,
        slug: data.slug,
        layoutId: data.layoutId,
        updatedAt: now,
      })
      .where(eq(pages.id, id)),

    // レイアウトの変更の場合、古いデータを削除
    ...(page.layoutId != data.layoutId
      ? [
        db
          .delete(attributeValues)
          .where(eq(attributeValues.pageId, id)),
      ]
      : []),

    ...(dataAttributeValues.length ?
      // dataAttributeValues.map(attribute => {
      //   return db.update(attributeValues)
      //     .set({
      //      valueInteger: attribute.valueInteger,
      //      valueText: attribute.valueText
      //     })
      // })

      [
        db.insert(attributeValues)
          .values(dataAttributeValues)
          .onConflictDoUpdate({
            target: [
              attributeValues.pageId,
              attributeValues.attributeId,
            ],
            set: {
              valueText: sql`excluded.value_text`,
              valueInteger: sql`excluded.value_integer`,
            },
          })
      ] : [])
  ]);

  const classParseData = data.attributes
    .map(({ value }) => value)
    .join("\n");

  await updateClasses(db, { recordType: "pages", recordId: id, html: classParseData })
  await updateTailwind(db)

  // await updateClasses(db, { recordType: "pages", recordId: id, html: data.body })
  // await updateTailwind(db)
}

export async function deletePage(db: Database, id: string) {
  await db.delete(pages).where(eq(pages.id, id));

  await updateTailwind(db)
}
