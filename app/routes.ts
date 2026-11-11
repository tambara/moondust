import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
    index("routes/home.tsx"),
route(":slug", "routes/page.tsx"),
  route("login", "routes/login.tsx"),
route("admin/users", "routes/admin.users.tsx"),
  route("auth/*", "routes/api.auth.$.ts"),


] satisfies RouteConfig;
