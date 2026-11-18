
import { authClient } from "~/lib/auth-client";
import { Link } from "react-router";
import {  Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SubmenuTrigger } from "~/components/area/Menu";
import { Button } from "~/components/area/button";
import { MoreHorizontal } from "lucide-react";

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
      <Button  >
        <Link to="/admin/login">ログイン</Link>
      </Button>
    );
  }

  const isAdmin = session.user.role === "admin";
  return (<MenuTrigger>
  <Button aria-label="Actions" variant="secondary">
    {session.user.name}
  </Button>
  <Menu>

    <MenuItem onAction={() => alert('open')}>Open</MenuItem>
    <MenuItem onAction={() => alert('rename')}>Rename…</MenuItem>
    <MenuItem onAction={() => alert('duplicate')}>Duplicate</MenuItem>
    <MenuItem onAction={() => alert('delete')}>Delete…</MenuItem>
    <SubmenuTrigger>
      <MenuItem>Share</MenuItem>
      <Menu>
        <MenuItem>Email</MenuItem>
        <MenuItem>SMS</MenuItem>
        <MenuItem>Instagram</MenuItem>
      </Menu>
    </SubmenuTrigger>
    <MenuSeparator />
    <MenuSection selectionMode="multiple" defaultSelectedKeys={['files']}>
      <MenuItem id="files">Show files</MenuItem>
      <MenuItem id="folders">Show folders</MenuItem>
    </MenuSection>
  </Menu>
</MenuTrigger>
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
