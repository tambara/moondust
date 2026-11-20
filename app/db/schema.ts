import { relations, sql } from "drizzle-orm";
import { blob, index, integer, real, SQLiteColumn, sqliteTable, text, unique, uniqueIndex, type AnySQLiteColumn, type SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
// ルーティング
export const nodeTypes = ["file", "directory", "markdown", "number"] as const;
const primaryKey = (name = "id") =>
  text(name)
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

const timestamps = () => ({
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
})

export const routes = sqliteTable("routes", {
  id: primaryKey(),
  parentId: text("parent_id")
    .references((): AnySQLiteColumn => routes.id),
  // description: text("description").notNull().default(""),
  slug: text("slug").notNull(),
  pageId: text("page_id")
    .references(() => pages.id),
  ...timestamps()
  // type: text("type").$type<(typeof nodeTypes)[number]>().notNull() // file / directory
},
  (table) => [
    // uniqueIndex("routes_single_root")
    // .on(sql`1`)
    // .where(sql`${table.parentId} IS NULL`),
    unique().on(table.parentId, table.slug),
  ]
);
export const routesRelations = relations(routes, ({ one, many }) => ({
  parent: one(routes, {
    fields: [routes.parentId],
    references: [routes.id],
    relationName: "parent_children",
  }),
  children: many(routes, {
    relationName: "parent_children",
  }),
  page: one(pages, {
    fields: [routes.pageId],
    references: [pages.id],
  }),
}));

// EAVテーブル
export const valueTypes = ["text", "html", "markdown", "number"] as const;

export const attributes = sqliteTable("attributes", {
  id: primaryKey(),
  label: text("label").notNull(),
  name: text("name").notNull(),
  position: integer("position").notNull(),
  description: text("description").notNull().default(""),
  setting: text("setting", { mode: "json" }).$type<{
    title: string;
    description: string;
  }>(),

  valueType: text("value_type").$type<(typeof valueTypes)[number]>()
    .notNull(),
  layoutId: text("layout_id").references(() => layouts.id),

  ...timestamps()
},
  (table) => [
    unique().on(table.layoutId, table.name),
  ]
);

// 属性値
export const attributeValues = sqliteTable("attribute_values", {
  id: primaryKey(),


  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id),

  pageId: text("record_id").notNull(),

  valueText: text("value_text"),
  valueInteger: integer("value_integer"),
  valueReal: real("value_real"),
  valueBlob: blob("value_blob"),
  valueJson: text("value_json"),
  ...timestamps()

}, (table) => [
  uniqueIndex("attribute_values_page_attribute_unique")
    .on(table.pageId, table.attributeId),
]);

// inode相当
// TODO: nodesに改名
export const pages = sqliteTable("pages", {
  id: primaryKey(),
  title: text("title").notNull(),
  // リダイレクト先などに使用
  data: text("data").notNull(),
  layoutId: text("layout_id").notNull().references(() => layouts.id),
  ...timestamps()

});

export const layouts = sqliteTable("layouts", {
  id: primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  body: text("body").notNull(),
  contentType: text("content_type").notNull(),
  // content_disposition: text("content_disposition").notNull(),
  ...timestamps()

});

export const pagesRelations = relations(pages, ({ one, many }) => ({
  layout: one(layouts, {
    fields: [pages.layoutId],
    references: [layouts.id],
  }),
  attributeValues: many(attributeValues),

}));
export const attributeValuesRelations = relations(attributeValues, ({ one }) => ({
  page: one(pages, {
    fields: [attributeValues.pageId],
    references: [pages.id],
  }),
  attribute: one(attributes, {
    fields: [attributeValues.attributeId],
    references: [attributes.id],
  }),
}));

export const attributesRelations = relations(attributes, ({ one }) => ({
  layout: one(layouts, {
    fields: [attributes.layoutId],
    references: [layouts.id],
  }),
}));
export const layoutsRelations = relations(layouts, ({ many }) => ({
  attributes: many(attributes),
}));
/*
 for tailwind
*/
export const htmlClasses = sqliteTable(
  "html_classes",
  {
    id: primaryKey(),
    value: text("body").notNull(),

    recordType: text("record_type").notNull(),
    recordId: text("record_id").notNull(),

    ...timestamps()

  },
  (table) => [
    uniqueIndex("html_classes_record_unique").on(
      table.recordType,
      table.recordId,
    ),
  ],
);

// システム用
export type SettingsMimeType = {
  label: string;
  value: string;
};


export const systemSettings = sqliteTable("system_settings", {
  name: text("name").primaryKey(),
  value: text("value", { mode: "json" }).notNull(),
  ...timestamps()

});

/*
* Cloudflare Dynamic Worker
*/
export const scripts = sqliteTable("scripts", {
  id: primaryKey(),
  name: text("name").notNull().unique(),
  body: text("body").notNull(),
  ...timestamps()

});


export * from "./auth-schema";


