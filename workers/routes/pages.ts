import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDb } from "~/db";
import { pages, routes } from "~/db/schema";

export default new Hono<{ Bindings: Env }>()
    .get("/", async (c) => {
        const db = createDb(c.env.pages);
        const pages = await db.query.pages.findMany();
        const routes = await db.query.routes.findMany();

        return c.json({ pages, routes });
    })
    .get("/new", async (c) => {
        const db = createDb(c.env.pages);

        const layoutItems = await db.query.layouts.findMany({
            with: {
                attributes: true,
            },
        });
        const routesItem = await db.select().from(routes)
        return c.json({ routes: routesItem ?? [], layouts: layoutItems })
    })
    .get("/edit/:id", async (c) => {
        const paramId = c.req.param("id");

        const db = createDb(c.env.pages);
        const layoutItems = await db.query.layouts.findMany({
            with: {
                attributes: true,
            },
        });
        const page = await db.query.pages.findFirst({
            where: eq(pages.id, paramId),
            with: {
                layout: true,
                attributeValues: true,
            },
        });
        const pageRoute = await db.select().from(routes).where(
            eq(routes.pageId, paramId)
        ) ?? [];

        if (!page) {
            throw new Response("Page not found", { status: 404 });
        }

        const routesItem = await db.select().from(routes)

        return c.json({ routes: routesItem, pageRoute, page, layouts: layoutItems });
    })
    .post("/update/:id", async (c) => {
        const paramId = c.req.param("id");
        const db = createDb(c.env.pages);

        const { parsePageForm } = await import("../../app/features/pages/services/page-form.server");

        console.log("1 /update/:id")

        const parsed = await parsePageForm(db, await c.req.formData());
        console.log("2 /update/:id")

        if (!parsed.success) {
            return c.json({ success: parsed.success, result: parsed.result });
        }
        console.log("3 /update/:id")

        const { updatePage } = await import(
            "../../app/features/pages/services/page-service.server"
        );

        await updatePage(db, paramId, parsed.data, parsed.layoutItem);

        return c.json({ success: parsed.success, result: parsed.result });
        //  return c.redirect("/admin/pages");
    });
