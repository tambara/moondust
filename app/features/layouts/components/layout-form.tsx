
import { getInputProps, getTextareaProps } from "@conform-to/react";
import type { FieldMetadata } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";


type LayoutFormProps = {
  fields: {
    name: FieldMetadata<string>;
    body: FieldMetadata<string>;
  };
  submitting?: boolean;
  submitLabel?: string;
};

export function LayoutForm({
  fields,
  submitting = false,
  submitLabel = "保存",
}: LayoutFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={fields.name.id}>レイアウト名</Label>
        <Input
          {...getInputProps(fields.name, { type: "text" })}
                  placeholder="例：標準レイアウト"
        required
        />
        <p className="text-sm text-destructive">
          {fields.name.errors}
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor={fields.body.id}>本文</Label>
        <Textarea
          {...getTextareaProps(fields.body)}
            rows={24}
        />
            <p className="text-xs text-muted-foreground">
            {'<slot name="content" />'} の位置にページ本文が挿入されます。
            {'<slot name="title" />'} の位置にタイトルが挿入されます。
          </p>
    </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "保存中..." : submitLabel}
      </Button>
    </div>
  );
}
