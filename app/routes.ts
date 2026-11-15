import { type RouteConfig, index, layout, route } from "@react-router/dev/routes";

export default [

  layout("routes/admin/layout.tsx", [
    route("admin/login", "routes/admin/login.tsx"),
    route("auth/*", "routes/api.auth.$.ts"),
    route("admin/pages", "routes/admin/pages.tsx"),
    route("admin/pages/new", "routes/admin/pages.new.tsx"),
    route("admin/pages/:id/edit", "routes/admin/pages.edit.tsx"),

    route("admin/layouts", "routes/admin/layouts.tsx"),
    route("admin/layouts/new", "routes/admin/layouts.new.tsx"),
    route("admin/layouts/:id/edit", "routes/admin/layouts.edit.tsx"),

    route("admin/scripts", "routes/admin/scripts.tsx"),
    route("admin/scripts/new", "routes/admin/scripts.new.tsx"),
    route("admin/scripts/:id/edit", "routes/admin/scripts.edit.tsx"),

    route("admin/users", "routes/admin/users.tsx"),
    route("admin/users/new", "routes/admin/users.new.tsx"),
    route("admin/users/:id/edit", "routes/admin/users.edit.tsx"),

    route("admin/export", "routes/admin/export.ts"),

  ]),
  // route(":slug", "routes/pag.tsx"),
] satisfies RouteConfig;
