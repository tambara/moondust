
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { scripts, layouts } from "~/db/schema";
import { createDb } from "~/db";
import { scriptSchema } from "~/features/scripts/schemas/script-schema";
import { cloudflareContext } from "../../../workers/app";
import { ScriptForm } from "~/features/scripts/components/script-form";
import { eq } from "drizzle-orm";
import "~/lib/zod";
import type { Route } from "./+types/scripts.edit";

export async function loader({ context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const script = await db.query.scripts.findFirst({
    where: eq(scripts.id, params.id),
  });

  if (!script) {
    throw new Response("Page not found", { status: 404 });
  }

  return { script };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const formData = await request.formData();
  console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
  console.log(Object.fromEntries(formData));
  const submission = parseWithZod(formData, {
    schema: scriptSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { updateScript } = await import(
    "~/features/scripts/services/script-service.server"
  );

  await updateScript(db, params.id!, submission.value);

  return redirect("/admin/scripts");
}

export default function EditScript() {
  const { script } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      name: script.name,
      body: script.body,
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: scriptSchema,
      });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">スクリプト編集</h1>
        <p className="text-sm text-muted-foreground">
          スクリプトを編集します。
        </p>
      </div>

      <Form id={form.id}
        method="post" className="space-y-6">
        {form.errors?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}

        <ScriptForm
          fields={fields}
          submitting={navigation.state === "submitting"}
          submitLabel="更新"
        />
      </Form>
    </div>
  );
}