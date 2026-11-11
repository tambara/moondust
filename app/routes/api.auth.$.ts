import { requireUser } from "~/lib/auth-guard.server";
import { cloudflareContext } from "../../workers/app";
import type { Route } from "./+types/api.auth.$";

import { createAuth } from "~/lib/auth.server";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);

  
  return createAuth(env).handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  return createAuth(env).handler(request);
}