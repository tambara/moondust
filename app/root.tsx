import {
  isRouteErrorResponse,
  Link,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { Code, HomeSimpleDoor, LogOut, Slash, User } from 'iconoir-react';
import { Post } from 'iconoir-react';
import { LayoutLeft } from 'iconoir-react';

import type { Route } from "./+types/root";
import "./app.css";
import { LoginStatus } from "./features/auth/components/login-status";
import { Button, buttonVariants } from "./components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./components/ui/tooltip";
import { cn } from "cn";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        <TooltipProvider >
          <div className="relative min-h-screen grid grid-cols-[64px_1fr] grid-rows-[64px_1fr]">
            <div>
              <aside className="min-h-screen fixed left-0 w-[64px] top-0  p-2  bg-stone-500 flex flex-col items-center justify-between">
                <div className="w-full">

                  <SidebarButton to="/" label="ルート" icon={Slash} />

                </div>
                <div className="w-full space-y-1">
                  <SidebarButton to="/admin" label="ホーム" icon={HomeSimpleDoor} />

                  <SidebarButton to="/admin/users" label="ユーザー" icon={User} />
                  <SidebarButton to="/admin/pages" label="ページ" icon={Post} />
                  <SidebarButton to="/admin/layouts" label="レイアウト" icon={LayoutLeft} />
                </div>

                <div className="w-full">
                  <SidebarButton to="/admin/logout" label="ログアウト" icon={LogOut} />
                </div>

              </aside>
            </div>
            <div className="min-h-screen grid grid-rows-[auto_1fr_auto]">
              <header className="flex h-14 items-center justify-between border-b px-6 bg-white">
                <LoginStatus />
              </header>
              <main className="mx-auto max-w-4xl bg-white px-3 w-full py-8">
                {children}
              </main>
              <footer></footer>
            </div>
          </div>
        </TooltipProvider>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return <Outlet />;
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}


function SidebarButton({ label, icon: Icon, to }: {
  label: string;
  icon: React.ElementType;
  to: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger
        render={

          <Link
            to={to}
            className={cn(buttonVariants({ variant: "ghost", size: "icon" }), "w-full h-auto aspect-square group")}
          />
        }
      >
        <Icon
          strokeWidth={1.4}
          className="size-8 transition-transform duration-300 group-hover:scale-110"
        />
      </TooltipTrigger>

      <TooltipContent side="right">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}