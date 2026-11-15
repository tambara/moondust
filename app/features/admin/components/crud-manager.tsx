
import { useCallback, useEffect, useState, type ReactNode } from "react";

import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { ResourceList } from "./resource-list";
import { useNavigate } from "react-router";

type CrudManagerProps<T, CreateData, UpdateData> = {
  title: string;
  createTitle: string;
  editTitle: string;

  getId: (item: T) => string;
  renderItem: (item: T) => ReactNode;

  loadItems: (search: string) => Promise<T[]>;
  createItem: (data: CreateData) => Promise<void>;
  updateItem: (id: string, data: UpdateData) => Promise<void>;
  deleteItem: (item: T) => Promise<void>;

  renderCreateForm: (props: {
    onSubmit: (data: CreateData) => Promise<void>;
    loading: boolean;
  }) => ReactNode;

  renderEditForm: (props: {
    item: T;
    onSubmit: (data: UpdateData) => Promise<void>;
    onCancel: () => void;
    loading: boolean;
  }) => ReactNode;

  searchPlaceholder?: string;
  emptyMessage?: string;
  confirmDelete?: (item: T) => boolean;
};

export function CrudManager<T, CreateData, UpdateData>({
  title,
  createTitle,
  editTitle,
  getId,
  renderItem,
  loadItems,
  createItem,
  updateItem,
  deleteItem,
  renderCreateForm,
  renderEditForm,
  searchPlaceholder = "検索",
  emptyMessage = "データがありません。",
  confirmDelete,
}: CrudManagerProps<T, CreateData, UpdateData>) {
  const [items, setItems] = useState<T[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<T | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      setItems(await loadItems(search));
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "データを取得できませんでした。",
      );
    } finally {
      setLoading(false);
    }
  }, [loadItems, search]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleCreate(data: CreateData) {
    setSaving(true);
    setError("");

    try {
      await createItem(data);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "追加できませんでした。",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleUpdate(data: UpdateData) {
    if (!editing) return;

    setSaving(true);
    setError("");

    try {
      await updateItem(getId(editing), data);
      setEditing(null);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "更新できませんでした。",
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(item: T) {
    if (
      confirmDelete &&
      !confirmDelete(item)
    ) {
      return;
    }

    setSaving(true);
    setError("");

    try {
      await deleteItem(item);
      await refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "削除できませんでした。",
      );
    } finally {
      setSaving(false);
    }
  }
const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {error && (
        <p className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{createTitle}</CardTitle>
        </CardHeader>
        <CardContent>
          {renderCreateForm({
            onSubmit: handleCreate,
            loading: saving,
          })}
        </CardContent>
      </Card>

      <ResourceList
        title="ページ一覧"
        items={items}
        getId={(page) => getId(page)}
        renderItem={renderItem}
        searchPlaceholder="ページを検索..."
        emptyMessage="ページがありません"
        loading={loading}
        saving={saving}
        onSearch={setSearch}
        onEdit={(page) => navigate(`/admin/users/${getId(page)}/edit`)}
        onDelete={handleDelete}
      />

      {editing !== null && (
        <Card>
          <CardHeader>
            <CardTitle>{editTitle}</CardTitle>
          </CardHeader>
          <CardContent>
            {renderEditForm({
              item: editing,
              onSubmit: handleUpdate,
              onCancel: () => setEditing(null),
              loading: saving,
            })}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
