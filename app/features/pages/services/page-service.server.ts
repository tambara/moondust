import { and, eq, isNull, sql } from "drizzle-orm";
import { attributeValues, pages, routes, valueTypes } from "~/db/schema";
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
  path: string;
  layoutId: string;
  attributes: AttributeValuesInput[]
};



async function createGenetateRoutes(db: Database, savePath: string[], currentRoot: any) {

  /*
  * ルートを作成のみ
  */
  // パスのIDを生成
  let savePathPatentId: string | null = null
  let genId = false

  const savePathIdWithName: { id: string, slug: string }[] = []

  for (const slug of savePath) {
    if (genId) {
      const id = crypto.randomUUID()
      savePathIdWithName.push({ id, slug })
      savePathPatentId = id
      continue
    }

    const result: typeof routes.$inferSelect | undefined
      = await db.query.routes.findFirst({
        where: and(
          eq(routes.slug, slug),
          savePathPatentId === null
            ? isNull(routes.parentId)
            : eq(routes.parentId, savePathPatentId)
        ),
      })

    // 現在のルート（更新予定のルートは移動するので）は入れないため
    if (result && currentRoot.id !== result.id) {
      savePathPatentId = result.id
      savePathIdWithName.push({ id: savePathPatentId, slug })
    } else {
      const id = crypto.randomUUID()
      savePathIdWithName.push({ id, slug })
      savePathPatentId = id
      genId = true
    }
  }

  let routePatentId: string | null = null
  const routeQueries = savePathIdWithName.map((item, index) => {
    const currentId = item.id
    const result = {
        id: currentId,
        pageId: null,
        slug: item.slug,
        parentId: routePatentId
      }
    // const result = db.insert(routes)
    //   .values({
    //     id: currentId,
    //     pageId: null,
    //     slug: item.slug,
    //     parentId: routePatentId
    //   })
    //   .onConflictDoNothing();

    routePatentId = currentId
    return result
  }
  )
  return routeQueries
}

async function createRoutes(db: Database, savePath: Awaited<ReturnType<typeof getCreateRoutesData>>) {

  /*
  * ルートを作成のみ
  */
  // パスのIDを生成
  // let savePathPatentId: string | null = null
  // let genId = false

  // const savePathIdWithName: { id: string, slug: string }[] = []

  // for (const slug of savePath) {
  //   if (genId) {
  //     const id = crypto.randomUUID()
  //     savePathIdWithName.push({ id, slug })
  //     savePathPatentId = id
  //     continue
  //   }

  //   const result: typeof routes.$inferSelect | undefined
  //     = await db.query.routes.findFirst({
  //       where: and(
  //         eq(routes.slug, slug),
  //         savePathPatentId === null
  //           ? isNull(routes.parentId)
  //           : eq(routes.parentId, savePathPatentId)
  //       ),
  //     })

  //   if (result) {
  //     savePathPatentId = result.id
  //     savePathIdWithName.push({ id: savePathPatentId, slug })
  //   } else {
  //     const id = crypto.randomUUID()
  //     savePathIdWithName.push({ id, slug })
  //     savePathPatentId = id
  //     genId = true
  //   }
  // }

  let routePatentId: string | null = null
  const routeQueries = savePath.map((item, index) => {
    const currentId = item.id
    const result = {
      id: item.id,
      pageId: item.pageId,
      slug: item.slug,
      parentId: item.parentId
    }

    // db.insert(routes)
    // .values({
    //   id: currentId,
    //   pageId: null,
    //   slug: item.slug, parentId: routePatentId
    // })
    // .onConflictDoNothing();

    // routePatentId = currentId
    return result
  }
  )
  return routeQueries
}

// ルートの新規作成および更新
async function createRouteQuery(db: Database, data: PageInput, pageId: string, isNew: boolean) {

  const normalize = (s: string) =>
    s.replace(/\/+/g, '/').replace(/^\/|\/$/g, '')

  // 連続する/を一つにする
  data.path = data.path.replace(/\/+/g, '/')
  // 先頭と末尾の/を削除
  data.path = normalize(data.path)

  const savePath = data.path.split("/")
  let createPaths = []


  const beforeRouteQueries = []
  let currentRoute = null
  if (isNew) {
    console.log("NEWNEWNEWNEWNEWNEWNEWNEW")
    // 新規
    const savePathRoutes = await getCreateRoutesData(db, savePath)
    currentRoute = savePathRoutes.at(-1)
    if (!currentRoute) {
      throw Error("予期しないエラー")
    }

    if (currentRoute.pageId !== null) {
      // savePathのルートがすでに存在すればエラー
      throw Error("すでにそのルートは存在します")
    }
    currentRoute.pageId = pageId
    createPaths = savePathRoutes.slice(0, -1)

  } else {
    // 更新
    console.log("UPDATEUPDATEUPDATEUPDATEUPDATEUPDATE")
    const savePathRoutes = await getCreateRoutesData(db, savePath)
    if (!savePath.length) {
      throw Error("予期しないエラー")
    }
    // savePathのルートがすでに存在し、自分のpageIdが違うならエラー
    const lastNewRoute = savePathRoutes.at(-1)
    console.log("lastNewRoute")
    console.log(lastNewRoute)
    if (!lastNewRoute) {
      throw Error("予期しないエラー")
    }

    if (lastNewRoute.pageId !== null && lastNewRoute.pageId !== pageId) {
      throw Error("すでにそのルートは別のページが存在します")
    }

    currentRoute = await getPageRoute(db, pageId)
    if (!currentRoute) {
      throw Error("更新するルートが存在しません")
    }

    // lastNewRoute.pageId = pageId
    createPaths = savePathRoutes.slice(0, -1)

    // のちにルートを作成するときのために、現在のルートを削除
    // pageを一緒に削除しないようにnullにする
    // beforeRouteQueries.push(
    //   db
    //     .update(routes)
    //     .set({
    //       parentId: null,
    //     })
    //     .where(eq(routes.id, currentRoute.id)),
    // )
    // beforeRouteQueries.push(
    //   db
    //     .delete(routes)
    //     .where(eq(routes.id, currentRoute.id)),
    // )

    // 一時退避
    beforeRouteQueries.push(
      db
        .update(routes)
        .set({
          // parentId: null,
          slug: crypto.randomUUID(),
        })
        .where(eq(routes.id, currentRoute.id)),
    )

    // currentPageRouteをsavePathのルートに移動
  }

  // 最後尾のルートは別に作成のため、それ以前を作成
  const createRoutesQueryDatas = await createGenetateRoutes(db, savePath.slice(0, -1), currentRoute)

  const pageSlug = savePath.at(-1)
  if (!pageSlug) {
    throw Error("予期しないエラー")
  }

  const pageRouteParent = isNew ? createRoutesQueryDatas.at(-1) : createRoutesQueryDatas.at(-1)

  console.log("createRoutesQueryDatas!!!!!!!!!!")
  console.log(createRoutesQueryDatas)
  console.log("insert!!!!!!!!!!")
  console.log({
    pageId: pageId,
    parentId: pageRouteParent?.id,
    slug: pageSlug
  })

  return [
    ...beforeRouteQueries,
    ...createRoutesQueryDatas.map(route => {
      return db.insert(routes)
        .values(route)
        .onConflictDoNothing();
    }),
    ...(isNew ? [
      db.insert(routes)
        .values({
          id: crypto.randomUUID(),
          pageId: pageId,
          parentId: pageRouteParent?.id,
          slug: pageSlug
        })
    ] : [
      // db
      //   .insert(routes)
      //   .values({
      //     id: currentRoute!.id,
      //     pageId: currentRoute!.pageId,
      //     parentId: pageRouteParent?.id,
      //     slug: pageSlug
      //   }),
      db
        .update(routes)
        .set({
          pageId: pageId,
          parentId: pageRouteParent?.id ?? null,
          slug: pageSlug
        })
        .where(eq(routes.id, currentRoute.id)),
    ]),

  ]
}

export async function createPage(db: Database, data: PageInput, layout: Awaited<ReturnType<typeof getLayoutWithAttributes>>) {
  const now = Date.now();
  const pageId = crypto.randomUUID()

  const routeQueries = await createRouteQuery(db, data, pageId, true)

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
        pageId: pageId,
        ...attribureValue
        // layoutId: id,
        // name: attribute.name,
        // valueType: attribute.valueType,
      }
    }) : []

  const queries = [
    db.insert(pages).values({
      id: pageId,
      data: "",
      title: data.title,
      layoutId: data.layoutId,
      createdAt: now,
      updatedAt: now,
    }),
    ...routeQueries,

    ...(dataAttributeValues.length
      ? [
        db.insert(attributeValues).values(
          dataAttributeValues
        ),
      ]
      : []),
  ];

  await db.batch(queries as [typeof queries[number], ...typeof queries[number][]]);

  const classParseData = data.attributes
    .map(({ value }) => value)
    .join("\n");

  await updateClasses(db, { recordType: "pages", recordId: pageId, html: classParseData })
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

async function getPageRoute(db: Database, pageId: string) {
  return await db.query.routes.findFirst({
    where: eq(routes.pageId, pageId)
  });
}

async function getCreateRoutesData(db: Database, paths: string[]) {
  const result = []

  let parentId: string | null = null
  for (const path of paths) {
    const record: typeof routes.$inferSelect | undefined =
      await db.query.routes.findFirst({
        where: parentId === null ? and(isNull(routes.parentId), eq(routes.slug, path))
          : and(eq(routes.parentId, parentId), eq(routes.slug, path))
      })
    if (!record) {
      const id = crypto.randomUUID()
      result.push({ id: id, parentId: parentId, slug: path, pageId: null });
      parentId = id
      break
    } else {
      result.push(record);
      parentId = record.id
    }
  }

  return result
}

export async function updatePage(db: Database, pageId: string, data: PageInput, layout: Awaited<ReturnType<typeof getLayoutWithAttributes>>) {


  const now = Date.now();

  const routeQueries = await createRouteQuery(db, data, pageId, false)

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
        pageId: pageId,
        ...attribureValue
        // layoutId: id,
        // name: attribute.name,
        // valueType: attribute.valueType,
      }
    }) : []

  const page = await db.query.pages.findFirst({
    where: eq(pages.id, pageId),
    with: {
      layout: true,
    },
  });

  if (!page) {
    throw Error("無効なページ")
  }

  const queries = [
    db
      .update(pages)
      .set({
        title: data.title,
        layoutId: data.layoutId,
        updatedAt: now,
      })
      .where(eq(pages.id, pageId)),

    // レイアウトの変更の場合、古いデータを削除
    ...(page.layoutId != data.layoutId
      ? [
        db
          .delete(attributeValues)
          .where(eq(attributeValues.pageId, pageId)),
      ]
      : []),

    ...routeQueries,
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
  ];


  await db.batch(queries as [typeof queries[number], ...typeof queries[number][]]);

  const classParseData = data.attributes
    .map(({ value }) => value)
    .join("\n");

  await updateClasses(db, { recordType: "pages", recordId: pageId, html: classParseData })
  await updateTailwind(db)

  // await updateClasses(db, { recordType: "pages", recordId: id, html: data.body })
  // await updateTailwind(db)
}

export async function deletePage(db: Database, id: string) {
  await db.delete(pages).where(eq(pages.id, id));

  await updateTailwind(db)
}
