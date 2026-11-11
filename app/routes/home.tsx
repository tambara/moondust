import { randomUUID } from "node:crypto";
import { Form, Link, redirect, useLoaderData } from "react-router";
import { createDb } from "~/db";
import { pages } from "~/db/schema";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { Route } from "./+types/home";
import { cloudflareContext } from "../../workers/app";
import { requireUser } from "~/lib/auth-guard.server";
import { LoginStatus } from "~/features/auth/components/login-status";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

  const result = await db.select().from(pages);
  const session = await requireUser(request, env);

  return { pages: result,
 };
}

export async function action({ request, context }: Route.ActionArgs) {
  const formData = await request.formData();

  const title = String(formData.get("title") ?? "").trim();
  const slug = String(formData.get("slug") ?? "").trim();
  const body = String(formData.get("body") ?? "");

  if (!title || !slug) {
    throw new Response("タイトルとSlugは必須です", { status: 400 });
  }

  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);
  const now = Date.now();

  await db.insert(pages).values({
    id: randomUUID(),
    slug,
    title,
    body,
    createdAt: now,
    updatedAt: now,
  });

  return redirect(`/${slug}`);
}

export default function Home({ loaderData }: Route.ComponentProps) {
  return <>
<LoginStatus/>
<main className="mx-auto max-w-3xl space-y-8 p-6">
  <h1 className="text-3xl font-bold tracking-tight">Wiki</h1>

  <Card>
    <CardHeader>
      <CardTitle>ページ作成</CardTitle>
    </CardHeader>

    <CardContent>
      <Form method="post" className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="title">タイトル</Label>
          <Input id="title" name="title" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug</Label>
          <Input id="slug" name="slug" required />
        </div>

        <div className="space-y-2">
          <Label htmlFor="body">本文</Label>
          <Textarea id="body" name="body" rows={10} />
        </div>

        <Button type="submit">作成</Button>
      </Form>
    </CardContent>
  </Card>

  <section className="space-y-4">
    <h2 className="text-xl font-semibold">ページ一覧</h2>

    <Card>
      <CardContent className="pt-6">
        <ul className="divide-y">
          {loaderData.pages.map((page) => (
            <li key={page.id} className="py-3">
              <Link
                to={`/${page.slug}`}
                className="text-primary hover:underline"
              >
                {page.title}
              </Link>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  </section>
</main>
</>
}

