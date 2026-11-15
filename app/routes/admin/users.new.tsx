
import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import { parseWithZod } from "@conform-to/zod/v4";
import { layouts } from "~/db/schema";
import { createDb } from "~/db";
import { pageSchema } from "~/features/pages/schemas/page-schema";
import { cloudflareContext } from "../../../workers/app";
import { PageForm } from "~/features/pages/components/page-form";
import type { Route } from "./+types/pages.new";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const layoutItems = await db.select().from(layouts);

  return { layouts: layoutItems };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();

  const submission = parseWithZod(formData, {
    schema: pageSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { createPage } = await import(
    "~/features/pages/services/page-service.server"
  );

  await createPage(db, submission.value);

  return redirect("/admin/pages");
}

export default function NewPage() {
  const { layouts } = useLoaderData<typeof loader>();
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  // const [form, fields] = useForm({
  //   lastResult,
  //   shouldValidate: "onBlur",
  //   shouldRevalidate: "onInput",
  //   onValidate({ formData }) {
  //     return parseWithZod(formData, {
  //       schema: pageSchema,
  //     });
  //   },
  // });

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ページを作成します。
        </p>
      </div>


      <PageForm
      lastResult={lastResult}
        defaultValue={{
          title: "",
          slug: "",
          body: "",
          layoutId: undefined,
        }}
        layouts={layouts}
        submitting={isSubmitting}
        submitLabel="作成"
      />
    </div>
  );
}