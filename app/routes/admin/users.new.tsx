
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
import { UserForm } from "~/features/users/components/user-form";

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

  const { createUser } = await import(
    "~/features/users/services/user-service.server"
  );

  await createUser(db, submission.value);

  return redirect("/admin/pages");
}

export default function NewPage() {
  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ユーザー新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ユーザーを作成します。
        </p>
      </div>


      <UserForm
        lastResult={lastResult}
        defaultValue={{
          name: "",
          email: "",
          role: "User",
        }}
        submitting={navigation.state === "submitting"}
        submitLabel="更新"
      />
    </div>
  );
}