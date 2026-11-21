import { Hono } from "hono";
import { createDb } from "~/db";

const layouts = new Hono<{ Bindings: Env }>()
    .get("/", async (c) => {
        const db = createDb(c.env.pages);
        const layouts = await db.query.layouts.findMany();

        return c.json({layouts});
    });

export default layouts;