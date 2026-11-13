
import { getInputProps, getTextareaProps } from "@conform-to/react";
import type { FieldMetadata } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";


type ScriptFormProps = {
  fields: {
    name: FieldMetadata<string>;
    body: FieldMetadata<string>;
  };
  submitting?: boolean;
  submitLabel?: string;
};

export function ScriptForm({
  fields,
  submitting = false,
  submitLabel = "保存",
}: ScriptFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={fields.name.id}>名前</Label>
        <Input
          {...getInputProps(fields.name, { type: "text" })}
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
          rows={30}
        />
      </div>

      <Button type="submit" disabled={submitting}>
        {submitting ? "保存中..." : submitLabel}
      </Button>
    </div>
  );
}
