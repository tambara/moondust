import { Hono } from "hono";
import { createDb } from "~/db";

const routes = new Hono<{ Bindings: Env }>()
    .get("/", async (c) => {
        const db = createDb(c.env.pages);
        const routes = await db.query.routes.findMany();

        return c.json({routes});
    });

export default routes;