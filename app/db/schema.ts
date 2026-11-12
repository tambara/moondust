import { relations } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable("pages", {
  id: text("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  body: text("body").notNull(),
  layoutId: integer("layout_id").references(() => layouts.id),
  createdAt: integer("created_at").notNull(),
  updatedAt: integer("updated_at").notNull(),
});

export const layouts = sqliteTable("layouts", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
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

export * from "./auth-schema";