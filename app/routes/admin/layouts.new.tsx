
import { Form, redirect, useActionData, useNavigation } from "react-router";
import { randomUUID } from "crypto";
import type { Route } from "./+types/admin/layouts.new";

import { createDb } from "~/db";
import { layouts } from "~/db/schema";
import { requireAdmin } from "~/lib/auth-guard.server";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { cloudflareContext } from "../../../workers/app";

export async function action({ request, context }: Route.ActionArgs) {
  const { env } = context.get(cloudflareContext);
  await requireAdmin(request, env);

  const formData = await request.formData();

  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "");

  if (!name) {
    return { error: "Layout名を入力してください。" };
  }

  if (!body.trim()) {
    return { error: "HTMLを入力してください。" };
  }

  const db = createDb(env.pages);

  await db.insert(layouts).values({
    id: randomUUID(),
    name,
    body,
  });

  return redirect("/admin/layouts");
}

export default function NewLayoutPage() {
  const actionData = useActionData<typeof action>();
  const navigation = useNavigation();

  const isSubmitting = navigation.state === "submitting";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Layout新規作成</h1>
        <p className="text-sm text-muted-foreground">
          ページに適用するHTMLレイアウトを作成します。
        </p>
      </div>

      <Form method="post" className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Layout名</Label>
          <Input
            id="name"
            name="name"
            placeholder="例：標準レイアウト"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">HTML</Label>
          <Textarea
            id="body"
            name="body"
            defaultValue={`<div class="container mx-auto">
  <main>
    <slot name="content" />
  </main>
</div>`}
            rows={24}
            className="font-mono text-sm"
            required
          />
          <p className="text-xs text-muted-foreground">
            {'<slot name="content" />'} の位置にページ本文が挿入されます。
            {'<slot name="title" />'} の位置にタイトルが挿入されます。
          </p>
        </div>

        {actionData?.error && (
          <p className="text-sm text-destructive">
            {actionData.error}
          </p>
        )}

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => window.location.href = "/admin/layouts"}
          >
            キャンセル
          </Button>

          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "保存中..." : "保存"}
          </Button>
        </div>
      </Form>
    </div>
  );
}
