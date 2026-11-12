import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  route("login", "routes/login.tsx"),
  route("admin/users", "routes/admin/users.tsx"),
  route("auth/*", "routes/api.auth.$.ts"),
  route("admin/pages", "routes/admin/pages.tsx"),
  route("admin/pages/new", "routes/admin/pages.new.tsx"),

  route("admin/layouts", "routes/admin/layouts.tsx"),
  route("admin/layouts/new", "routes/admin/layouts.new.tsx"),
  route("admin/layouts/:id/edit", "routes/admin/layouts.edit.tsx"),
  route(":slug", "routes/page.tsx"),
] satisfies RouteConfig;
