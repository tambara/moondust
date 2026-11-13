import { eq } from "drizzle-orm";
import { useLoaderData } from "react-router";

import { createDb } from "~/db";
import { pages } from "~/db/schema";

import type { Route } from "./+types/page";
import { cloudflareContext } from "../../workers/app";
import { getOptionalUser } from "~/lib/auth-guard.server";
import { LoginStatus } from "~/features/auth/components/login-status";
import { renderLayout } from "~/lib/render-layout.server";

export async function loader({ request, params, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const page = await db.query.pages.findFirst({
    where: eq(pages.slug, params.slug),
    with: {
      layout: true,
    },
  });

  if (!page) {
    throw new Response("Page not found", { status: 404 });
  }

  let html = ""
  if (page.layout !== null) {
    html = renderLayout(page.layout.body, {
      title: page.title,
      content: page.body,
    });
  }

  return {
    page,
    html,
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  return [
    { title: loaderData?.page.title },
  ];
}

export default function Page({ loaderData }: Route.ComponentProps) {
  const { html, page } = loaderData;

  return (<>
    <main>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </main>
  </>
  );
}