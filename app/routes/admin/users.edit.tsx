
import {
  redirect,
  useActionData,
  useNavigation,
} from "react-router";
import { parseWithZod } from "@conform-to/zod/v4";
import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import "~/lib/zod";
import type { Route } from "./+types/users.edit";
import { createAuth } from "~/lib/auth.server";
import { UserForm } from "~/features/users/components/user-form";
import { userSchema } from "better-auth";
import { requireAdmin } from "~/lib/auth-guard.server";

export async function loader({ request, context, params }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const auth = createAuth(env);

  const user = await auth.api.getUser({
    query: {
      id: params.id,
    },
    headers: request.headers,
  });
  return { user };
}

export async function action({ request, params, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  const auth = createAuth(env);
  const currentUser = await requireAdmin(request, env);

  const formData = await request.formData();
  const submission = parseWithZod(formData, {
    schema: userSchema,
  });

  if (submission.status !== "success") {
    return submission.reply();
  }

  const db = createDb(env.pages);

  const { updateUser } = await import(
    "~/features/users/services/user-service.server"
  );

  await updateUser(currentUser.session.id, db, params.id!, submission.value);

  return redirect("/admin/pages");
}

export default function Edit({
  loaderData,
}: Route.ComponentProps) {

  const user = loaderData.user

  const lastResult = useActionData<typeof action>();
  const navigation = useNavigation();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ユーザー編集</h1>
        <p className="text-sm text-muted-foreground">
          ユーザーを編集します。
        </p>
      </div>

      <UserForm
        lastResult={lastResult}
        defaultValue={{
          name: user.name,
          email: user.email,
          role: user.role,
        }}
        submitting={navigation.state === "submitting"}
        submitLabel="更新"
      />
    </div>
  );
}