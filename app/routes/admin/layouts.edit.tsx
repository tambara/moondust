
import { Form, redirect, useActionData, useLoaderData, useNavigation } from "react-router";
import type { Route } from "./+types/admin/layouts.new";

import { createDb } from "~/db";
import { cloudflareContext } from "../../../workers/app";
import { useForm } from "@conform-to/react";
import { parseWithZod } from "@conform-to/zod/v4";
import { layoutSchema } from "~/features/layouts/schemas/layout-schema";
import { LayoutForm } from "~/features/layouts/components/layout-form";
import { eq } from "drizzle-orm";
import { layouts } from "~/db/schema";

export async function loader({ context, params }: Route.LoaderArgs) {
    const { env } = context.get(cloudflareContext);
    const db = createDb(env.pages);

    const layout = await db.query.layouts.findFirst({
        where: eq(layouts.id, params.id),
    });

    if (!layout) {
        throw new Response("Page not found", { status: 404 });
    }

    return { layout };
}

export async function action({params, request, context }: Route.ActionArgs) {
    const formData = await request.formData();

    const submission = parseWithZod(formData, {
        schema: layoutSchema,
    });

    if (submission.status !== "success") {
        return submission.reply();
    }

    const { env } = context.get(cloudflareContext);
    const db = createDb(env.pages);

    const { updateLayout } = await import(
        "~/features/layouts/services/layout-service.server"
    );

    await updateLayout(db, params.id!, submission.value)
    return redirect("/admin/layouts");
}


export default function EditLayout() {
    const { layout } = useLoaderData<typeof loader>();
    const lastResult = useActionData<typeof action>();
    const navigation = useNavigation();

    const [form, fields] = useForm({
        lastResult,
        shouldValidate: "onBlur",
        shouldRevalidate: "onInput",
        defaultValue: {
            name: layout.name,
            body: layout.body,
        },

        onValidate({ formData }) {
            return parseWithZod(formData, {
                schema: layoutSchema,
            });
        },
    });

    const isSubmitting = navigation.state === "submitting";

    return (
        <div className="mx-auto max-w-5xl space-y-6">
            <div>
                <h1 className="text-2xl font-bold">レイアウト編集</h1>
                <p className="text-sm text-muted-foreground">
                    レイアウトを編集します。
                </p>
            </div>

                 <Form   id={form.id}
            method="post" {...form.props} className="space-y-6">
                {form.errors?.map((error) => (
                    <p key={error} className="text-sm text-destructive">
                        {error}
                    </p>
                ))}

                <LayoutForm
                    fields={fields}
                    submitting={isSubmitting}
                    submitLabel="保存"
                />
            </Form>
        </div>
    );
}