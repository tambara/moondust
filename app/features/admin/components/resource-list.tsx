
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";

type ResourceListProps<T> = {
  title: string;
  items: T[];
  getId: (item: T) => string | number;
  renderItem: (item: T) => React.ReactNode;

  searchPlaceholder?: string;
  emptyMessage?: string;

  loading?: boolean;
  saving?: boolean;

  onSearch: (query: string) => void | Promise<void>;
  onEdit: (item: T) => void;
  onDelete: (item: T) => void | Promise<void>;
};

export function ResourceList<T>({
  title,
  items,
  getId,
  renderItem,
  searchPlaceholder = "検索...",
  emptyMessage = "データがありません",
  loading = false,
  saving = false,
  onSearch,
  onEdit,
  onDelete,
}: ResourceListProps<T>) {
  const [search, setSearch] = useState("");

  const refresh = () => onSearch(search);

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Input
            placeholder={searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void refresh();
            }}
          />

          <Button
            variant="outline"
            onClick={() => void refresh()}
            disabled={loading}
          >
            検索
          </Button>
        </div>

        {loading ? (
          <p className="text-sm text-muted-foreground">
            読み込み中...
          </p>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {emptyMessage}
          </p>
        ) : (
          <div className="divide-y">
            {items.map((item) => (
              <div
                key={getId(item)}
                className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
              >
                <div className="min-w-0 flex-1">
                  {renderItem(item)}
                </div>

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={saving}
                    onClick={() => onEdit(item)}
                  >
                    編集
                  </Button>

                  <Button
                    size="sm"
                    variant="destructive"
                    disabled={saving}
                    onClick={() => void onDelete(item)}
                  >
                    削除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
