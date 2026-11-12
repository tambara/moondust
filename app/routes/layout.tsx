import { eq } from "drizzle-orm";
import { useLoaderData } from "react-router";

import { createDb } from "~/db";
import { pages } from "~/db/schema";

import type { Route } from "./+types/page";
import { cloudflareContext } from "../../workers/app";
import { getOptionalUser } from "~/lib/auth-guard.server";
import { LoginStatus } from "~/features/auth/components/login-status";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);
  const session = await getOptionalUser(request, env);

  const page = await db
    .select()
    .from(pages)
    .where(eq(pages.slug, params.slug))
    .get();

  if (!page) {
    throw new Response("Page not found", { status: 404 });
  }

  return { page,
 };
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { page } = loaderData;

  return (<>
    <main>
      <h1>{page.title}</h1>
      <p>{page.body}</p>
    </main>
  </>
  );
}