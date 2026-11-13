
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

export async function loader({ context,params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const layoutItems = await db.select().from(layouts);

    const page = await db.query.pages.findFirst({
      where: eq(pages.id, params.id),
      with: {
        layout: true,
      },
    });
  
    if (!page) {
      throw new Response("Page not found", { status: 404 });
    }
  
  return { page, layouts: layoutItems };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const formData = await request.formData();
console.log("^^^^^^^^^^^^^^^^^^^^^^^^^^^^^");
console.log(Object.fromEntries(formData));
  const submission = parseWithZod(formData, {
    schema: pageSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { updatePage } = await import(
    "~/features/pages/services/page-service.server"
  );

  await updatePage(db, params.id!, submission.value);

  return redirect("/admin/pages");
}

export default function EditPage() {
  const { page, layouts } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  const [form, fields] = useForm({
    lastResult,
    defaultValue: {
      title: page.title,
      slug: page.slug,
      body: page.body,
      layoutId: page.layoutId ?? undefined,
    },
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
    onValidate({ formData }) {
      return parseWithZod(formData, {
        schema: pageSchema,
      });
    },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page編集</h1>
        <p className="text-sm text-muted-foreground">
          ページを編集します。
        </p>
      </div>

      <Form   id={form.id}
method="post" className="space-y-6">
        {form.errors?.map((error) => (
          <p key={error} className="text-sm text-destructive">
            {error}
          </p>
        ))}

        <PageForm
          fields={fields}
          layouts={layouts}
          submitting={navigation.state === "submitting"}
          submitLabel="更新"
        />
      </Form>
    </div>
  );
}