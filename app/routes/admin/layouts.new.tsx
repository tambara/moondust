
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/admin/layouts.new";

import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { layoutSchema } from "~/features/layouts/schemas/layout-schema";
import { LayoutForm } from "~/features/layouts/components/layout-form";

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: layoutSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { createLayout } = await import(
    "~/features/layouts/services/layout-service.server"
  );

  await createLayout(db, submission.value)
  return redirect("/admin/layouts");
}


export default function NewLayout() {
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
            defaultValue: {
            body: `<div class="container mx-auto">
  <main>
    <slot name="content" />
  </main>
</div>`},

               

    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: layoutSchema,
      });
    },
  });

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ページを作成します。
        </p>
      </div>

           <Form   id={form.id}
 method="post"  className="space-y-6">
        {form.errors?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}

        <LayoutForm
          fields={fields}
          submitting={isSubmitting}
          submitLabel="作成"
        />
      </Form>
    </div>
  );
}