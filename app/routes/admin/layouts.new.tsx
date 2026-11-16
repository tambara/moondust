
import {  redirect,  } from "react-router";

import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import { layoutSchema } from "~/features/layouts/schemas/layout-schema";
import { LayoutForm } from "~/features/layouts/components/layout-form";
import type { Route } from "./+types/layouts";
import { parseSubmission, report } from "@conform-to/react/future";
import { eq } from "drizzle-orm";
import { systemSettings, type SettingsMimeType } from "~/db/schema";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const setting = await db.query.systemSettings.findFirst({
    where: eq(systemSettings.name, "mime-types"),
  },);


const mimeTypes = setting?.value as SettingsMimeType[] | undefined;
  return { mimeTypes: mimeTypes ?? [] }
}
export async function action({ request, context }: Route.ActionArgs) {
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

  const { createLayout } = await import(
    "~/features/layouts/services/layout-service.server"
  );

  await createLayout(db, result.data)
  return redirect("/admin/layouts");
}


export default function NewLayout() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">レイアウト新規作成</h1>
        <p className="text-sm text-muted-foreground">
          レイアウトを作成します。
        </p>
      </div>


      <LayoutForm
        defaultValue={{
                 contentType: "text/html",
   name: "",
          body: "",
          attributes: [],
        }}
        submitLabel="作成"
      />
    </div>
  );
}