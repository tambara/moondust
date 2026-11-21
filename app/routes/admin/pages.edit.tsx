
import {
  redirect,
  useLoaderData,
} from "react-router";
import { createDb } from "~/db";
import { cloudflareContext, type AppType } from "../../../workers/app";
import { PageForm } from "~/features/pages/components/page-form";
import "~/lib/zod";
import type { Route } from "./+types/pages.edit";
import { hc } from "hono/client";

export async function loader({ request, params }: Route.LoaderArgs) {
  const app = hc<AppType>(new URL(request.url).origin);
  const res = await app.api.pages.edit[":id"].$get({
    param: {
      id: params.id,
    },
  });
  return await res.json();
}

export async function action({ params, request, context }: Route.ActionArgs) {
  const app = hc<AppType>(new URL(request.url).origin);
  const res = await app.api.pages.update[":id"].$post({
    param: {
      id: params.id,
    },
  });
  const result = await res.json();
  if (!result.success) {
    return result

  }
  return redirect("/admin/pages");
}

export default function EditPage() {
  const { page, routes, pageRoute, layouts } = useLoaderData<typeof loader>();

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page編集</h1>
        <p className="text-sm text-muted-foreground">
          ページを編集します。
        </p>
      </div>

      <PageForm
        defaultValue={{
          title: page.title,
          layoutId: page.layoutId,
          attributeValues: page.attributeValues
        }}
        pageRoute={pageRoute}
        routes={routes}
        layouts={layouts}
        submitLabel="更新"
      />
    </div>
  );
}