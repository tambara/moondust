import { relations } from "drizzle-orm";
import { blob, index, integer, real, SQLiteColumn, sqliteTable, text, unique, uniqueIndex, type SQLiteTableWithColumns } from "drizzle-orm/sqlite-core";
// ルーティング
export const nodeTypes = ["file", "directory", "markdown", "number"] as const;


export const nodes = sqliteTable("nodes", {
  id: text("id").primaryKey(),
  type: text("type").$type<(typeof nodeTypes)[number]>().notNull() // file / directory
  // その他のメタデータ
});

export const entries = sqliteTable("entries", {
  id: text("id").primaryKey(),
  parentId: text("parent_id").notNull(),
  nodeId: text("node_id").notNull().references(() => nodes.id),
  name: text("name").notNull(),
});

// EAVテーブル
export const valueTypes = ["text", "html", "markdown", "number"] as const;

export const attributes = sqliteTable("attributes", {
  id: text("id").primaryKey(),
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

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
},
  (table) => [
    unique().on(table.layoutId, table.name),
  ]
);

// 属性値
export const attributeValues = sqliteTable("attribute_values", {
  id: text("id").primaryKey(),

  attributeId: text("attribute_id")
    .notNull()
    .references(() => attributes.id),

  pageId: text("record_id").notNull(),

  valueText: text("value_text"),
  valueInteger: integer("value_integer"),
  valueReal: real("value_real"),
  valueBlob: blob("value_blob"),
  valueJson: text("value_json"),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
}, (table) => [
  uniqueIndex("attribute_values_page_attribute_unique")
    .on(table.pageId, table.attributeId),
]);


export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  // body: text("body").notNull(),
  layoutId: text("layout_id").notNull().references(() => layouts.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const layouts = sqliteTable("layouts", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  description: text("description"),
  body: text("body").notNull(),
  contentType: text("content_type").notNull(),
  // content_disposition: text("content_disposition").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
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
    id: text("id").primaryKey(),
    value: text("body").notNull(),

    recordType: text("record_type").notNull(),
    recordId: text("record_id").notNull(),

    createdAt: integer("created_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date()),

    updatedAt: integer("updated_at", { mode: "timestamp" })
      .notNull()
      .$defaultFn(() => new Date())
      .$onUpdate(() => new Date()),
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
});

/*
* Cloudflare Dynamic Worker
*/
export const scripts = sqliteTable("scripts", {
  id: text("id").primaryKey(),
  name: text("name").notNull().unique(),
  body: text("body").notNull(),

  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),

  updatedAt: integer("updated_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date())
    .$onUpdate(() => new Date()),
});


export * from "./auth-schema";


