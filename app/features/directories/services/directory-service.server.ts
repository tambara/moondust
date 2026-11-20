// import { eq, sql } from "drizzle-orm";
// import { attributeValues, directoryEntries, valueTypes } from "~/db/schema";
// import type { createDb } from "~/db";
// import { updateClasses, updateTailwind } from "~/features/html-classes/services/classes.server";
// import type { getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";
// import { th } from "zod/v4/locales";

// type Database = ReturnType<typeof createDb>;

// export type DirectoryInput = {
//   path: string;
// };

// export async function createDirectory(db: Database, data: DirectoryInput) {
//   const now = Date.now();

//   if (!data.path.startsWith("/")) {
//     throw Error("path is failed")
//   }

//   const batch = []

//   const names = data.path.split("/")
//   const dir = await db.query.routes.findFirst({
//     where: eq(directoryEntries.name, names[0]),
//   },);
//   if (!dir) {
//     batch.push(
//       db.insert(directoryEntries).values({
//       id: crypto.randomUUID(),
//       parentId: null,
//       name: names[0],
//       createdAt: now,
//       updatedAt: now,
//     })
//     )
//   }



//   await db.batch([
//     db.insert(directoryEntries).values({
//       id: id,
//       title: data.title,
//       slug: data.slug,
//       layoutId: data.layoutId,
//       createdAt: now,
//       updatedAt: now,
//     }),
//     // db
//     //   .delete(attributeValues)
//     //   .where(eq(attributes.layoutId, id)),

//   ]);
// }

// export async function updateDirectory(db: Database, id: string, data: DirectoryInput, layout: Awaited<ReturnType<typeof getLayoutWithAttributes>>) {
//   const now = Date.now();

//   const dataAttributeValues = layout?.attributes?.length ?
//     data.attributes.map((attribute) => {
//       const layoutAttribute = layout?.attributes.find(e => e.id === attribute.attributeId)
//       if (!layoutAttribute) {
//         throw Error("")
//       }
//       const attribureValue = getAttribureValueFrom(
//         layoutAttribute.valueType, attribute.value)

//       return {
//         id: attribute.id ?? crypto.randomUUID(),
//         attributeId: attribute.attributeId,
//         directoryId: id,
//         ...attribureValue
//         // layoutId: id,
//         // name: attribute.name,
//         // valueType: attribute.valueType,
//       }
//     }) : []

//   const directory = await db.query.directoryEntries.findFirst({
//     where: eq(directoryEntries.id, id),
//     with: {
//       layout: true,
//     },
//   });

//   if (!directory) {
//     throw Error("無効なページ")
//   }


//   await db.batch([
//     db
//       .update(directoryEntries)
//       .set({
//         title: data.title,
//         slug: data.slug,
//         layoutId: data.layoutId,
//         updatedAt: now,
//       })
//       .where(eq(directoryEntries.id, id)),

//     // レイアウトの変更の場合、古いデータを削除
//     ...(directory.layoutId != data.layoutId
//       ? [
//         db
//           .delete(attributeValues)
//           .where(eq(attributeValues.directoryId, id)),
//       ]
//       : []),

//     ...(dataAttributeValues.length ?
//       // dataAttributeValues.map(attribute => {
//       //   return db.update(attributeValues)
//       //     .set({
//       //      valueInteger: attribute.valueInteger,
//       //      valueText: attribute.valueText
//       //     })
//       // })

//       [
//         db.insert(attributeValues)
//           .values(dataAttributeValues)
//           .onConflictDoUpdate({
//             target: [
//               attributeValues.directoryId,
//               attributeValues.attributeId,
//             ],
//             set: {
//               valueText: sql`excluded.value_text`,
//               valueInteger: sql`excluded.value_integer`,
//             },
//           })
//       ] : [])
//   ]);

//   const classParseData = data.attributes
//     .map(({ value }) => value)
//     .join("\n");

//   await updateClasses(db, { recordType: "directorys", recordId: id, html: classParseData })
//   await updateTailwind(db)

//   // await updateClasses(db, { recordType: "directorys", recordId: id, html: data.body })
//   // await updateTailwind(db)
// }

// export async function deleteDirectory(db: Database, id: string) {
//   await db.delete(directoryEntries).where(eq(directoryEntries.id, id));

//   await updateTailwind(db)
// }
