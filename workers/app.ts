import { createRequestHandler, RouterContextProvider } from "react-router";
import { createContext } from "react-router";

export const cloudflareContext = createContext<{
  env: Env;
  ctx: ExecutionContext;
}>();

const requestHandler = createRequestHandler(
  () => import("virtual:react-router/server-build"),
  import.meta.env.MODE,
  
);

export default {
  async fetch(request, env, ctx) {
    const routerContext = new RouterContextProvider();

    routerContext.set(cloudflareContext, { env, ctx });

    return requestHandler(request, routerContext);
  },
} satisfies ExportedHandler<Env>;