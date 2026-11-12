import { UserManagement } from "~/features/admin/components/user-management";
import type { Route } from "./+types/admin/users";

import { requireAdmin } from "~/lib/auth-guard.server";
import { LoginStatus } from "~/features/auth/components/login-status";
import { cloudflareContext } from "../../../workers/app";

export async function loader({
  request,
  context,
}: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);

  const session = await requireAdmin(request, env);

  return {
    user: session.user,
  };
}

export default function AdminUsers({
  loaderData,
}: Route.ComponentProps) {
  return (
    <>
    <main className="container mx-auto space-y-6 py-8">
      <h1 className="text-2xl font-bold">ユーザー管理</h1>

      <p className="text-sm text-muted-foreground">
        管理者：{loaderData.user.name}
      </p>
            <UserManagement currentUserId={loaderData.user.id} />

    </main>
  </>);
}