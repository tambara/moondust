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
import type { Route } from "./+types/admin/pages";
import { cloudflareContext } from "../../../workers/app";
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
<main className="mx-auto max-w-3xl space-y-8 p-6">
  <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Page管理</h1>
        <Button >
          <Link to="/admin/pages/new">新規作成</Link>
        </Button>
      </div>

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

