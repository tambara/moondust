import { useLoaderData } from "react-router";
import { authClient } from "~/lib/auth-client";
import { Button } from "~/components/ui/button";

export function LoginStatus() {
    const data = useLoaderData(); // loaderから取得したデータを使用
    const { data: session, isPending } = authClient.useSession();

    return <div className="flex items-center justify-between">
        <div>
            {isPending ? (
                <span className="text-sm text-muted-foreground">
                    認証状態を確認中...
                </span>
            ) : session ? (
                <span className="text-sm">
                    {session.user.name}
                </span>
            ) : (
                <span className="text-sm text-muted-foreground">
                    未ログイン
                </span>
            )}
        </div>

        {session && (
            <Button
                variant="outline"
                onClick={async () => {
                    await authClient.signOut();
                    window.location.href = "/login";
                }}
            >
                ログアウト
            </Button>
        )}
    </div>
}