
import { authClient } from "~/lib/auth-client";
import { Link } from "react-router";
import { MoreHorizontal } from "lucide-react";
import { Button } from "~/components/ui/button";

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
      <Button render={<Link to="/admin/login">ログイン</Link>} >
        
      </Button>
    );
  }

  const isAdmin = session.user.role === "admin";
  return (
  <Button aria-label="Actions" variant="secondary">
    {session.user.name}
  </Button>
)
  // return (
  //   <MenuTrigger>
  //     <Button >
  //       {session.user.name}
  //       <span aria-hidden="true">⌄</span>
  //     </Button>

  //     <Menu
  //       aria-label="ユーザーメニュー"
  //       className="w-48"
  //     >
  //       <MenuSection>
  //         <Header>{session.user.name}</Header>
  //       </MenuSection>

  //       {session.user.role === "admin" && (
  //         <>
  //           <MenuSection>
  //             <Header>管理</Header>

  //             <MenuItem href="/admin/users">
  //               ユーザー管理
  //             </MenuItem>

  //             <MenuItem href="/admin/layouts">
  //               レイアウト一覧
  //             </MenuItem>

  //             <MenuItem href="/admin/pages">
  //               ページ一覧
  //             </MenuItem>

  //             <MenuItem href="/admin/scripts">
  //               スクリプト一覧
  //             </MenuItem>

  //             <MenuItem href="/admin/export">
  //               エクスポート
  //             </MenuItem>
  //           </MenuSection>
  //         </>
  //       )}

  //       <MenuItem
  //         onAction={async () => {
  //           await authClient.signOut();
  //           window.location.href = "/login";
  //         }}
  //       >
  //         ログアウト
  //       </MenuItem>
  //     </Menu>
  //   </MenuTrigger>
  // );

}
