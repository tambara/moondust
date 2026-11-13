import { relations } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  layoutId: text("layout_id").references(() => layouts.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const layouts = sqliteTable("layouts", {
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
export const pagesRelations = relations(pages, ({ one }) => ({
  layout: one(layouts, {
    fields: [pages.layoutId],
    references: [layouts.id],
  }),
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
export const systemSettings = sqliteTable("system_settings", {
  name: text("name").primaryKey().unique(),
  value: text("value").notNull(),
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
