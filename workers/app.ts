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
import { renderLayout } from "~/lib/template";

const api = new Hono<{ Bindings: Env }>();
api.get("/tailwind.css", async (c) => {
  const db = createDb(c.env.pages);

  const tailwindcss = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.name, "tailwindcss"),
  });

  if (!tailwindcss) {
    return c.notFound();
  }

  return c.body(tailwindcss.value, 200, {
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
    },
  });

  if (!page) {
    return c.notFound();
  }

  if (page.layout !== null) {

    const html = await renderLayout(page.layout.body, {
      page
    });

    // const locals = {
    //   page,
    //   renderPage: (data = {}) =>
    //     ejs.render(page.body, {
    //       ...locals,
    //       ...data,
    //     }),
    // };

    // const html = ejs.render(page.layout.body, locals);
    return c.html(html);
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