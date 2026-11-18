
import {
  redirect,
  useLoaderData,
} from "react-router";
import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import type { Route } from "./+types/pages.new";
import { DirectoryForm } from "~/features/directories/components/derectory-form";
import { routes } from "~/db/schema";
import { directorySchema } from "~/features/directories/schemas/directory-schema";
import { parseSubmission, report } from "@conform-to/react/future";


export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const result = await db.select().from(routes);
  return { routes: result };
}

export async function action({ request, context }: Route.ActionArgs) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);
  
  const formData = await request.formData();
  const submission = parseSubmission(formData);
  const result = directorySchema.safeParse(submission.payload);

  if (!result.success) {
    return {
      result: report(submission, {
        error: {
          issues: result.error.issues,
        },
      }),
    };
  }


  const { createDirectory } = await import(
    "~/features/directories/services/directory-service.server"
  );

  await createDirectory(db, result.data);

  return redirect("/admin/pages");
}

export default function NewPage() {
  const { routes } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">ディレクトリ新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ページを作成します。
        </p>
      </div>

      <DirectoryForm
        defaultValue={{
          path: "",
        }}
        routes={routes}
        submitLabel="作成"
      />
    </div>
  );
}