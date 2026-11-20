import { Link, useNavigate } from "react-router";
import { createDb } from "~/db";
import { pages, routes } from "~/db/schema";
import { cloudflareContext } from "../../../workers/app";
import type { Route } from "./+types/pages";
import { useState } from "react";
import { ResourceList } from "~/features/admin/components/resource-list";
import { TreeView, TreeViewDndContext, type TreeNodeNested } from "~/components/tree-view";
import { ContextMenu, ContextMenuContent, ContextMenuGroup, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from "~/components/ui/context-menu";
import { PencilIcon, ShareIcon, TrashIcon } from "lucide-react";

export async function loader({ request, context }: Route.LoaderArgs) {
  const { env } = context.get(cloudflareContext);
  const db = createDb(env.pages);

    const { requireUser } = await import(
    "~/lib/auth-guard.server"
  );


  const result = await db.select().from(pages);
  const session = await requireUser(request, env);
  const routesItem = await db.select().from(routes)

  return {
    pages: result,
    routes: routesItem,
  };
}

export default function Pages({ loaderData }: Route.ComponentProps) {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  async function handleDelete(item: any) {

  }

  interface FileData {
    name: string;
  }

  function f(currentId: string | null, routesData: typeof loaderData["routes"]) {
    const result: TreeNodeNested<FileData>[] = []
    for (const r of routesData.filter(item => item.parentId === currentId)) {
      result.push({
        id: r.id,
        data: { name: r.slug },
        isGroup: true,
        children: f(r.id, routesData),
      })
    }
    return result
  }

  let itemsA = f(null, loaderData.routes)

  const [itemsC, setItems] = useState(itemsA)
  const [expandedIds, setExpandedIds] = useState<string[]>([]);

  // 指定したノードの子に追加
  const addChild = (parentId: string) => {
    const newNode: TreeNodeNested<FileData> = {
      id: crypto.randomUUID(),
      data: { name: "新しいページ" },
    };

    setItems((prev) => {
      const update = (
        nodes: TreeNodeNested<FileData>[],
      ): TreeNodeNested<FileData>[] =>
        nodes.map((node) => {
          if (node.id === parentId) {
            return {
              ...node,
              isGroup: true,
              children: [...(node.children ?? []), newNode],
            };
          }

          if (node.children) {
            return {
              ...node,
              children: update(node.children),
            };
          }

          return node;
        });

      return update(prev);
    });

    // 追加した親ノードを展開
    setExpandedIds((prev) =>
      prev.includes(parentId) ? prev : [...prev, parentId],
    );
  };


  return <>
    <section className="space-y-4">
      <ResourceList
        title="ページ一覧"
        items={loaderData.pages}
        getId={(user) => user.id}
        renderItem={(user) => (
          <>
            <p className="font-medium">{user.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              ID:{user.id}
            </p>
            <p className="truncate text-sm text-muted-foreground">
              作成日:{user.createdAt.toLocaleString("ja-JP", {
                year: "numeric",
                month: "long",
                day: "numeric",
                weekday: "short",
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit",
              })}
            </p>
          </>
        )}
        searchPlaceholder="ページを検索..."
        emptyMessage="ペ０時がありません"
        onSearch={setSearch}
        onNew={() => `/admin/pages/new`}
        onEdit={(page) => `/admin/pages/${page.id}/edit`}
        onDelete={handleDelete}
      />
    </section>

    {expandedIds.map(item => item)}
    <TreeView
      className="border p-4"
      expandedIds={expandedIds}
      onExpandedIdsChange={setExpandedIds}

      onItemsChange={(items) => {
        setItems(items);
      }}

      treeId="tree-a" items={itemsC} draggable droppable renderNode={({ node, isExpanded, depth, toggle, hasChildren }) => (

        <div className="flex p-1" style={{ paddingLeft: depth * 20 }} onClick={toggle}>
          {hasChildren ? (isExpanded ? "▼ " : "▶ ") : "  "}


          <ContextMenu>
            <ContextMenuTrigger className="">
              {node.data.name}
            </ContextMenuTrigger>
            <ContextMenuContent>
              <ContextMenuGroup>
                <ContextMenuItem onClick={(e) => {
                  e.stopPropagation();
                  addChild(node.id);
                }}

                >
                  <PencilIcon />
                  Add
                </ContextMenuItem>
                <ContextMenuItem>
                  <ShareIcon />
                  Share
                </ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuGroup>
                <ContextMenuItem variant="destructive">
                  <TrashIcon />
                  Delete
                </ContextMenuItem>
              </ContextMenuGroup>
            </ContextMenuContent>
          </ContextMenu>



        </div>
      )}
    />


    {/* <TreeView<FileData> draggable droppable
      items={items}
      renderNode={({ node, isExpanded, depth, toggle, hasChildren }) => (
        <div style={{ paddingLeft: depth * 20 }} onClick={toggle}>
          {hasChildren ? (isExpanded ? "▼ " : "▶ ") : "  "}
          {node.data.name}
        </div>
      )}
    /> */}
  </>
}

