
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/layouts.edit";

import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import { parseWithZod } from "@conform-to/zod/v4";
import { layoutSchema } from "~/features/layouts/schemas/layout-schema";
import { LayoutForm } from "~/features/layouts/components/layout-form";
import { eq } from "drizzle-orm";
import { layouts } from "~/db/schema";
import { parseSubmission, report } from "@conform-to/react/future";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const layout = await db.query.layouts.findFirst({
    where: eq(layouts.id, params.id),
     with: {
      attributes: true,
    },

  },);

  if (!layout) {
    throw new Response("Page not found", { status: 404 });
  }

  return { layout };
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const formData = await request.formData();
  const submission = parseSubmission(formData);
  const result = layoutSchema.safeParse(submission.payload);

  if (!result.success) {
    return {
      result: report(submission, {
        error: {
          issues: result.error.issues,
        },
      }),
    };
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { updateLayout } = await import(
    "~/features/layouts/services/layout-service.server"
  );

  await updateLayout(db, params.id!, result.data)
  return redirect("/admin/layouts");



}

export default function EditPage() {
  const { layout } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">レイアウト編集</h1>
        <p className="text-sm text-muted-foreground">
          レイアウトを編集します。
        </p>
      </div>

      <LayoutForm
        defaultValue={{
          name: layout.name,
          body: layout.body,
          attributes: layout.attributes.map(e => ({
            name: e.name,
            valueType: e.valueType,
          })),
        }}
        submitLabel="更新"
      />
    </div>
  );
}