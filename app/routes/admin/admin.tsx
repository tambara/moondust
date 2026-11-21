import { redirect } from "react-router";
import { cloudflareContext } from "../../../workers/app";
import type { Route } from "./+types/admin";

export const middleware: Route.MiddlewareFunction[] = [
    async ({ request, context }, next) => {
       const { env } = context.get(cloudflareContext);
        const { requireAdmin } = await import(
            "~/lib/auth-guard.server"
        );
        const user = await requireAdmin(request, env);

        if (!user) {
            throw redirect("/admin/login");
        }

        return await next();
    },
];