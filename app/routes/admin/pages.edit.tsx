
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { pages, layouts } from "~/db/schema";
import { createDb } from "~/db";
import { pageSchema } from "~/features/pages/schemas/page-schema";
import { cloudflareContext } from "../../../workers/app";
import { PageForm } from "~/features/pages/components/page-form";
import { eq } from "drizzle-orm";
import "~/lib/zod";
import type { Route } from "./+types/pages.edit";
import { useCallback } from "react";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const layoutItems = await db.query.layouts.findMany({
    with: {
      attributes: true,
    },
  });
  const page = await db.query.pages.findFirst({
    where: eq(pages.id, params.id),
    with: {
      layout: true,
      attributeValues: true,
    },
  });

  if (!page) {
    throw new Response("Page not found", { status: 404 });
  }

  return { page, layouts: layoutItems };
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { parsePageForm } = await import(
    "~/features/pages/services/page-form.server"
  );

  const parsed = await parsePageForm(db, await request.formData());

  if (!parsed.success) {
    return { result: parsed.result };
  }

  const { updatePage } = await import(
    "~/features/pages/services/page-service.server"
  );

  await updatePage(db, params.id!, parsed.data, parsed.layoutItem);

  return redirect("/admin/pages");
}


export default function EditPage() {
  const { page, layouts } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page編集</h1>
        <p className="text-sm text-muted-foreground">
          ページを編集します。
        </p>
      </div>

      <PageForm
        defaultValue={{
          title: page.title,
          slug: page.slug,
          layoutId: page.layoutId,
          attributeValues: page.attributeValues
        }}
        layouts={layouts}
        submitLabel="更新"
      />
    </div>
  );
}