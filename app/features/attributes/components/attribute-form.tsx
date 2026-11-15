
import { getInputProps, getTextareaProps } from "@conform-to/react";
import type { FieldMetadata } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { useState } from "react";
import { attributes } from "~/db/schema";


type Layout = {
  id: string;
  name: string;
};

type AttributeFormProps = {
  fields: {
    valueType: FieldMetadata<string>
    attributeId: FieldMetadata<string>
    layoutId: FieldMetadata<string>
  };
  layouts: Layout[];

  submitting?: boolean;
  submitLabel?: string;
};

export function AttributeForm({
  fields,
  layouts,
  submitting = false,
  submitLabel = "保存",
}: AttributeFormProps) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor={fields.layoutId.id}>レイアウト</Label>
        <div className="space-y-2">
          <Label htmlFor={fields.attributeId.id}>Attribute</Label>
          <select
            id={fields.attributeId.id}
            name={fields.attributeId.name}
            defaultValue={fields.attributeId.initialValue ?? ""}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">レイアウトを選択してください</option>
            {layouts.map((attribute) => (
              <option key={attribute.id} value={attribute.id}>
                {attribute.name}
              </option>
            ))}
          </select>
        </div>
      </div>


      <Button type="submit" disabled={submitting}>
        {submitting ? "保存中..." : submitLabel}
      </Button>
    </div>
  );
}
