
import { getInputProps, getTextareaProps } from "@conform-to/react";
import type { FieldMetadata } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";

type Layout = {
  id: string;
  name: string;
};

type PageFormProps = {
  fields: {
    title: FieldMetadata<string>;
    slug: FieldMetadata<string>;
    body: FieldMetadata<string>;
    layoutId: FieldMetadata<string | undefined>;
  };
  layouts: Layout[];
  submitting?: boolean;
  submitLabel?: string;
};

export function PageForm({
  fields,
  layouts,
  submitting = false,
  submitLabel = "保存",
}: PageFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={fields.title.id}>タイトル</Label>
        <Input
          {...getInputProps(fields.title, { type: "text" })}
          required
        />
        <p className="text-sm text-destructive">
          {fields.title.errors}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fields.slug.id}>Slug</Label>
        <Input
          {...getInputProps(fields.slug, { type: "text" })}
          required
        />
        <p className="text-sm text-destructive">
          {fields.slug.errors}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fields.layoutId.id}>Layout</Label>
        <select
          id={fields.layoutId.id}
          name={fields.layoutId.name}
          defaultValue={fields.layoutId.initialValue ?? ""}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
        >
          <option value="">Layoutを選択してください</option>
          {layouts.map((layout) => (
            <option key={layout.id} value={layout.id}>
              {layout.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fields.body.id}>本文</Label>
        <Textarea
          {...getTextareaProps(fields.body)}
          rows={10}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "保存中..." : submitLabel}
      </Button>
    </div>
  );
}
