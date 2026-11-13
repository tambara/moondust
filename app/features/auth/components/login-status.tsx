
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Link } from "react-router";

export function LoginStatus() {
    const { data: session, isPending } = authClient.useSession();

    if (isPending) {
        return (
            <span className="text-sm text-muted-foreground">
                認証状態を確認中...
            </span>
        );
    }

    if (!session) {
        return (
            <Button variant="outline" >
                <Link to="/admin/login">ログイン</Link>
            </Button>
        );
    }

    const isAdmin = session.user.role === "admin";

return (
  <DropdownMenu>
    <DropdownMenuTrigger render={<Button variant="ghost" />}>
      {session.user.name}
      <span aria-hidden="true">⌄</span>
    </DropdownMenuTrigger>

    <DropdownMenuContent align="end" className="w-48">
      <DropdownMenuGroup>
        <DropdownMenuLabel>
          {session.user.name}
        </DropdownMenuLabel>
      </DropdownMenuGroup>

      {session.user.role === "admin" && (
        <>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuLabel>管理</DropdownMenuLabel>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/admin/users";
              }}
            >
              ユーザー管理
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/admin/layouts";
              }}
            >
              レイアウト一覧
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                window.location.href = "/admin/pages";
              }}
            >
              ページ一覧
            </DropdownMenuItem>
          <DropdownMenuItem
              onClick={() => {
                window.location.href = "/admin/scripts";
              }}
            >
              スクリプト一覧
            </DropdownMenuItem>          </DropdownMenuGroup>
        </>
      )}

      <DropdownMenuSeparator />

      <DropdownMenuItem
        onClick={async () => {
          await authClient.signOut();
          window.location.href = "/login";
        }}
      >
        ログアウト
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
);

}
