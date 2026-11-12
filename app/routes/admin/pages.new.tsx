import {
  Form,
  redirect,
  useActionData,
  useLoaderData,
  useNavigation,
} from "react-router";
import type { Route } from "./+types/admin/pages.new";
import { pages, layouts } from "~/db/schema";
import { createDb } from "~/db";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { cloudflareContext } from "../../../workers/app";

export async function loader({ context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const layoutItems = await db.select().from(layouts);

  return { layouts: layoutItems };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const body = String(formData.get("body") ?? "");
  const layoutId = String(formData.get("layoutId") ?? "") || null;

  if (!title || !slug) {
    throw new Response("タイトルとSlugは必須です", { status: 400 });
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  // 選択されたLayoutが存在することを確認
  if (layoutId) {
    const layout = await db.query.layouts.findFirst({
      where: (layouts, { eq }) => eq(layouts.id, layoutId),
    });

    if (!layout) {
      throw new Response("指定されたLayoutが存在しません", {
        status: 400,
      });
    }
  }

  const now = Date.now();

  await db.insert(pages).values({
    id: crypto.randomUUID(),
    slug,
    title,
    body,
    layoutId,
    createdAt: now,
    updatedAt: now,
  });

  return redirect("/admin/pages");
}

export default function NewPage() {
  const { layouts } = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Page新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ページを作成します。
        </p>
      </div>

      <Form method="post" className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="layoutId">Layout</Label>
          <select
            id="layoutId"
            name="layoutId"
            defaultValue=""
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">Layoutを選択してください</option>
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">本文</Label>
          <Textarea id="body" name="body" rows={10} />
        </div>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "作成中..." : "作成"}
        </Button>
      </Form>
    </div>
  );
}