
import { useForm, parseSubmission, report } from '@conform-to/react/future';

import type { FieldMetadata } from "@conform-to/react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Label } from "~/components/ui/label";
import { HtmlEditor } from "~/features/admin/components/html-editor";
import { useCallback, useEffect, useRef, useState } from "react";
import { Form, useActionData, useFetcher, useNavigation } from "react-router";
import { parseWithZod } from "@conform-to/zod/v4";
import { layoutAttributeSchema, layoutSchema } from "../schemas/layout-schema";
import { valueTypes } from "~/db/schema";
import { attributeSchema } from "~/features/attributes/schemas/attribute-schema";


type AttributeProps = {
  name: string;
  valueType: typeof valueTypes[number];
};

type LayoutFormProps = {
  defaultValue: {
    name: string;
    body: string;
    attributes: Array<AttributeProps>,
  };
  submitting?: boolean;
  submitLabel?: string;
};


export function LayoutForm({
  defaultValue,
  submitLabel = "保存",
}: LayoutFormProps) {
  const actionData = useActionData();
  const [body, setBody] = useState(defaultValue.body || "");
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const { form, fields, intent } = useForm(layoutSchema, {
    lastResult: actionData?.result,
    defaultValue: defaultValue,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  // const fetcher = useFetcher();
  const attributes = fields.attributes.getFieldList();

  type FirstAttributeProps = Omit<AttributeProps, "valueType"> & {
    valueType: AttributeProps["valueType"] | "";
  };

  const [firstAttribute, setFirstAttribute] = useState<FirstAttributeProps>({
    name: "",
    valueType: "",
  });
  // const bodyRef = useRef("");

  // const handleSubmit = useCallback(
  //   (e: React.FormEvent<HTMLFormElement>) => {
  //     e.preventDefault();

  //     const formData = new FormData(e.currentTarget);

  //     formData.set(
  //       fields.body.name,
  //       bodyRef.current ?? "",
  //     );
  //     fetcher.submit(formData, {
  //       method: "post",
  //     });
  //   },
  //   [fields.body.name, fetcher.submit],
  // );

  return (

    <Form {...form.props} id={form.id}
      // onSubmit={handleSubmit}
      method="post" className="space-y-6">
      {form.errors?.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {error}
        </p>
      ))}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={fields.name.id}>レイアウト名</Label>
          <Input
            type="text"
            id={fields.name.id}
            name={fields.name.name}
            defaultValue={fields.name.defaultValue}
            placeholder="例：標準レイアウト"
            aria-invalid={!fields.name.valid || undefined}
            aria-describedby={fields.name.ariaDescribedBy}
            required
          />
          <p className="text-sm text-destructive">
            {fields.name.errors}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fields.body.id}>本文</Label>

          <HtmlEditor
            value={body}
            onChange={setBody}
          />
          <input
            type="hidden"
            value={body}
            id={fields.body.id}
            name={fields.body.name}
          />
        </div>

        <div className="space-y-2">
          <div className="space-y-2">
            <Label >変数</Label>
            {/* 最初のInput */}
            <div className="flex gap-1">
              <Input
                type="text"
                placeholder="例：名前"
                required
                value={firstAttribute.name}
                onChange={(e) =>
                  setFirstAttribute((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
              />
              <select
                value={firstAttribute.valueType}
                onChange={(e) => {
                  setFirstAttribute((prev) => ({
                    ...prev,
                    valueType: e.target.value as FirstAttributeProps["valueType"],
                  }));
                }}
                // name="firstAttribute.valueType"
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="">データタイプを選択してください</option>
                {valueTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <Button
                type="button"
                disabled={!layoutAttributeSchema.safeParse(firstAttribute).success}
                onClick={() => {
                  intent.insert({
                    name: fields.attributes.name,
                    defaultValue: firstAttribute as AttributeProps
                  })
                  setFirstAttribute({
                    name: "",
                    valueType: "",
                  })
                }
                }
              >
                ＋ 追加
              </Button>
            </div>

            {/* 追加分 */}
            {attributes.map((item, index) => {
              const attributeFields = item.getFieldset();
              return <div className="flex gap-1" key={item.key}>
                {index + 1}.  <div>{attributeFields.name.defaultValue}</div>
                <div>{attributeFields.valueType.defaultValue}</div>
                <input
                  type="hidden"
                  value={attributeFields.name.defaultValue}
                  id={attributeFields.name.id}
                  name={attributeFields.name.name}
                />
                <input
                  type="hidden"
                  value={attributeFields.valueType.defaultValue}
                  id={attributeFields.valueType.id}
                  name={attributeFields.valueType.name}
                />

                <Button
                  type="button"
                  className={"bg-red-500"}
                  onClick={() =>
                    intent.remove({
                      name: fields.attributes.name,
                      index,
                    })
                  }
                >
                  削除
                </Button>
              </div>
            })}
          </div>
        </div>
        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>

    </Form>
  );
}
