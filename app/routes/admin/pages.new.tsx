
import {
  redirect,
  useLoaderData,
} from "react-router";
import { createDb } from "~/db";
import { cloudflareContext, type AppType } from "../../../workers/app";
import { PageForm } from "~/features/pages/components/page-form";
import type { Route } from "./+types/pages.new";
import { hc } from "hono/client";

export async function loader({ request }: Route.LoaderArgs) {
  const app = hc<AppType>(new URL(request.url).origin);
  const res = await app.api.pages.new.$get();
  return await res.json();
}

export async function action({ request, context }: Route.ActionArgs) {
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

  await createPage(db, parsed.data, parsed.layoutItem);

  return redirect("/admin/pages");
}

export default function NewPage() {
  const { routes, layouts } = useLoaderData<typeof loader>();

  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Tokyo',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value])
  );

  const formatted =
    `${values.year}-${values.month}-${values.day}-${values.hour}-${values.minute}${values.second}`;

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
          layoutId: "",
          attributeValues: []
        }}
        pageRoute={[]}
        routes={routes}
        layouts={layouts}
        submitLabel="作成"
      />
    </div>
  );
}