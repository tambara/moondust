
import {
  redirect,
  useLoaderData,
} from "react-router";
import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import { PageForm } from "~/features/pages/components/page-form";
import type { Route } from "./+types/pages.new";


export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const layoutItems = await db.query.layouts.findMany({
    with: {
      attributes: true,
    },
  });
  return { layouts: layoutItems };
}

export async function action({ request, context }: Route.ActionArgs) {
  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!")
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const { parsePageForm } = await import(
    "~/features/pages/services/page-form.server"
  );

  const parsed = await parsePageForm(db, await request.formData());

  if (!parsed.success) {
    return { result: parsed.result };
  }
  const { createPage } = await import(
    "~/features/pages/services/page-service.server"
  );
  console.log("222222222222222")

  await createPage(db, parsed.data, parsed.layoutItem);

  return redirect("/admin/pages");
}

export default function NewPage() {
  const { layouts } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ページを作成します。
        </p>
      </div>


      <PageForm
        defaultValue={{
          title: "",
          slug: "",
          layoutId: "",
          attributeValues:[]
        }}
        layouts={layouts}
        submitLabel="作成"
      />
    </div>
  );
}