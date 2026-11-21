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

import { Hono } from "hono";
import { createContext } from "react-router";

import route_pages from "./routes/pages";
import route_routes from "./routes/routes";
// import route_users from "./routes/users";
import route_open from "./routes/open";
import route_layouts from "./routes/layouts";

export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();

const app = new Hono<{ Bindings: Env }>()
  .route("/api/pages", route_pages)
  .route("/api/routes", route_routes)
  // .route("/api/users", route_users)
  .route("/api/layouts", route_layouts)
  .route("/", route_open)

export type AppType = typeof app;
export default app;