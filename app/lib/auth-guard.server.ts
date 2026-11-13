import { redirect } from "react-router";
import { createAuth } from "~/lib/auth.server";

export async function getOptionalUser(
  request: Request,
  env: Env,
) {
  const auth = createAuth(env);

  return auth.api.getSession({
    headers: request.headers,
  });
}

export async function requireUser(
  request: Request,
  env: Env,
) {
  const session = await getOptionalUser(request, env);

  if (!session) {
    throw redirect("/admin/login");
  }

  return session;
}
export async function requireAdmin(
  request: Request,
  env: Env,
) {
  const session = await requireUser(request, env);

  if (session.user.role !== "admin") {
    throw new Response("Forbidden", {
      status: 403,
    });
  }

  return session;
}