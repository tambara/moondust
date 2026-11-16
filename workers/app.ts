// import { createRequestHandler, RouterContextProvider } from "react-router";
// import { createContext } from "react-router";

// export const cloudflareContext = createContext<{
//   env: Env;
//   ctx: ExecutionContext;
// }>();

// const requestHandler = createRequestHandler(
//   () => import("virtual:react-router/server-build"),
//   import.meta.env.MODE,

// );

// export default {
//   async fetch(request, env, ctx) {
//     const routerContext = new RouterContextProvider();

//     routerContext.set(cloudflareContext, { env, ctx });

//     return requestHandler(request, routerContext);
//   },
// } satisfies ExportedHandler<Env>;

import { createRequestHandler, RouterContextProvider } from "react-router";
import { Hono } from "hono";
import { createContext } from "react-router";
import { escape } from 'he';

export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();


const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

const app = new Hono<{ Bindings: Env }>();

// PageはHonoで処理
import { eq } from "drizzle-orm";
import { createDb } from "~/db";
import { pages, systemSettings } from "~/db/schema";
import { engine } from "~/lib/template";
import { LiquidError } from "liquidjs";

const api = new Hono<{ Bindings: Env }>();
api.get("/tailwind.css", async (c) => {
  const db = createDb(c.env.pages);

  const tailwindcss = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.name, "tailwindcss"),
  });

  if (!tailwindcss) {
    return c.notFound();
  }

  return c.body(tailwindcss.value as string, 200, {
    "Content-Type": "text/css; charset=utf-8",
  });
});

api.get("/:slug", async (c) => {
  const db = createDb(c.env.pages);

  const slug = c.req.param("slug");

  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, slug),
    with: {
      layout: true,
      attributeValues: {
        with: {
          attribute: true,
        },
      },
    },
  });

  if (!page) {
    return c.notFound();
  }

  if (page.layout !== null) {

    try {
      const layoutTemplates = engine.parse(page.layout.body);

      const field = Object.fromEntries(
        page.attributeValues.map(item => [
          item.attribute.name,
          item.valueText,
        ])
      )

      const scope = {
        page: {
          id: page.id,
          slug: page.slug,
          title: page.title,
          layoutId: page.layoutId,
          createdAt: page.createdAt,
          updatedAt: page.updatedAt,
          field: field
        }
      }
      const html = await engine.render(layoutTemplates, {
        debug: escape(JSON.stringify({ page, scope }, null, 2)),
        ...scope
      });

      console.log(page.layout.contentType)

      return c.body(html, 200, {
        "Content-Type": `${page.layout.contentType}; charset=utf-8`,
      });

    } catch (error) {
      if (error instanceof LiquidError) {
        return c.text(error.message);
      }
      throw error
    }
  } else {
    return c.text("Layout is not found");
  }
});

// それ以外はReact Routerで処理
app.all("*", async (c) => {
  const routerContext = new RouterContextProvider();

  routerContext.set(cloudflareContext, {
    env: c.env,
    ctx: c.executionCtx as unknown as ExecutionContext,
  });


  const response = await requestHandler(c.req.raw, routerContext);

  // React Routerが404ならHonoにフォールバック
  if (response.status === 404) {
    return api.fetch(c.req.raw, c.env, c.executionCtx);
  }

  return response;
});


export default app;