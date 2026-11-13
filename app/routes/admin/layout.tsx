import { Outlet } from "react-router";
import { LoginStatus } from "~/features/auth/components/login-status";

export default function AdminLayout() {
  return (
    <>
        <Outlet />
    </>
  );
}