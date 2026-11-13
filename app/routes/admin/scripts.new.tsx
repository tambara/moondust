
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { layouts } from "~/db/schema";
import { createDb } from "~/db";
import { scriptSchema } from "~/features/scripts/schemas/script-schema";
import { cloudflareContext } from "../../../workers/app";
import {ScriptForm} from "~/features/scripts/components/script-form";
import type { Route } from "./+types/scripts.new";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  return {  };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema:scriptSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { createScript } = await import(
    "~/features/scripts/services/script-service.server"
  );

  await createScript(db, submission.value);

  return redirect("/admin/scripts");
}

export default function NewScripts() {
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: scriptSchema,
      });
    },
  });

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">スクリプト新規作成</h1>
        <p className="text-sm text-muted-foreground">
          スクリプトを作成します。
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
          submitting={isSubmitting}
          submitLabel="作成"
        />
      </Form>
    </div>
  );
}