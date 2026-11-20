import { cloudflareContext } from "../../workers/app";
import type { Route } from "./+types/api.auth.$";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);

  const { createAuth } = await import(
    "~/lib/auth.server"
  );

  return createAuth(env).handler(request);
}

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const { createAuth } = await import(
    "~/lib/auth.server"
  );
 return createAuth(env).handler(request);
}