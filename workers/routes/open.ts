

// PageはHonoで処理
import { and, eq, isNull } from "drizzle-orm";
import { createDb } from "~/db";
import { routes, systemSettings } from "~/db/schema";
import { engine } from "~/lib/template";
import { LiquidError } from "liquidjs";
import { createRequestHandler, RouterContextProvider } from "react-router";
import { Hono } from "hono";
import { escape } from 'he';
import { cloudflareContext } from "../app";


const open = new Hono<{ Bindings: Env }>()

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
);

open.get("/tailwind.css", async (c) => {
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


// React Routerで処理
open.all("*", async (c, next) => {
  const routerContext = new RouterContextProvider();

  routerContext.set(cloudflareContext, {
    env: c.env,
    ctx: c.executionCtx as unknown as ExecutionContext,
  });

  console.log("[Request]", c.req.method, c.req.path);

  const response = await requestHandler(c.req.raw, routerContext);
  console.log("[React Router]", {
    url: c.req.url,
    status: response.status,
    statusText: response.statusText,
    contentType: response.headers.get("Content-Type"),
  });


  // React Routerが404ならHonoにフォールバック
  if (response.status === 404) {
    console.log("[Fallback] Hono");
    return next();
  }

  return response;
});


open.all("*", async (c) => {

  const db = createDb(c.env.pages);

  async function findRouteFromPath(paths: string[]) {
    let id = null
    let result = null
    for (const path of paths) {
      result = await db.query.routes.findFirst({
        where: and(id === null ? isNull(routes.parentId) : eq(routes.parentId, id),
          eq(routes.slug, path)),
        with: {
          page: {
            with: {
              layout: true,
              attributeValues: {
                with: {
                  attribute: true,
                },
              }

            }
          },
        },

      })

      if (!result) {
        return null
      }

      id = result.id
      // with: {
      //   layout: true,
      //   attributeValues: {
      //     with: {
      //       attribute: true,
      //     },
      //   },
      // },
    }
    return result

  }

  let slug = c.req.path;
  if (slug === "/index.htm" || slug === "/index.html") {
    slug = "/"
  }

  const paths = slug === "/" ? [] : slug.split("/")

  const route = await findRouteFromPath(["/", ...paths])


  if (!route || !route.page || !route.page.layout) {
    console.log("DEBUG route:", JSON.stringify(route, null, 2));

    return c.notFound()
  }

  const page = route.page

  try {
    const layoutTemplates = engine.parse(page.layout.body);

    const field = Object.fromEntries(
      page.attributeValues.map(item => [
        item.attribute.name,
        item.valueText,
      ])
    )

    console.log("[attributeValues]")
    console.log(field)

    const scope = {
      slug,
      page: {
        id: page.id,
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
});

export default open
