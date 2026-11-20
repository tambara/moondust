import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [
  route("admin/login", "routes/admin/login.tsx"),
  route("admin", "routes/admin/admin.tsx", [
    index("routes/admin/index.tsx"),

    route("pages", "routes/admin/pages.tsx"),
    route("pages/new", "routes/admin/pages.new.tsx"),
    route("pages/:id/edit", "routes/admin/pages.edit.tsx"),

    route("layouts", "routes/admin/layouts.tsx"),
    route("layouts/new", "routes/admin/layouts.new.tsx"),
    route("layouts/:id/edit", "routes/admin/layouts.edit.tsx"),

    route("scripts", "routes/admin/scripts.tsx"),
    route("scripts/new", "routes/admin/scripts.new.tsx"),
    route("scripts/:id/edit", "routes/admin/scripts.edit.tsx"),

    route("users", "routes/admin/users.tsx"),
    route("users/new", "routes/admin/users.new.tsx"),
    route("users/:id/edit", "routes/admin/users.edit.tsx"),

    route("routes", "routes/admin/routes.tsx"),
    route("routes/new", "routes/admin/routes.new.tsx"),
    route("routes/:id/edit", "routes/admin/routes.edit.tsx"),

    route("export", "routes/admin/export.tsx"),
    route("import", "routes/admin/import.tsx"),
  ]),

  route("auth/*", "routes/api.auth.$.ts"),
  // route(":slug", "routes/pag.tsx"),
] satisfies RouteConfig;
