
import { useForm } from "@conform-to/react/future";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { CodeMirrorMarkdownEditor } from "@latentic/live-markdown";
import { useRef, useState } from "react";
import { pageSchema, type LayoutWithAttributes } from "../schemas/page-schema";
import { Form, useActionData, useNavigation } from "react-router";
import "@latentic/live-markdown/styles.css";
import type { attributes, layouts } from "~/db/schema";
import {
  NumberField,
  NumberFieldDecrement,
  NumberFieldGroup,
  NumberFieldIncrement,
  NumberFieldInput,
  NumberFieldScrubArea,
} from "~/components/reui/number-field"
import { HtmlEditor } from "~/features/admin/components/html-editor";
import { Textarea } from "~/components/ui/textarea";


type PageFormProps = {
  defaultValue: {
    title: string;
    slug: string;
    layoutId: string;
    attributeValues: Array<{
      id: string;
      createdAt: Date;
      updatedAt: Date;
      attributeId: string;
      pageId: string;
      valueText: string | null;
      valueInteger: number | null;
      valueReal: number | null;
      valueBlob: unknown;
      valueJson: string | null;
    }>
  };
  layouts: LayoutWithAttributes[];
  submitLabel?: string;
};

export function PageForm({
  defaultValue,
  layouts,
  submitLabel = "保存",
}: PageFormProps) {
  // const [body, setBody] = useState(fields.body.value ?? "");
  const lastResult = useActionData();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";
  const [layoutId, setLayoutId] = useState(defaultValue.layoutId);

  const { form, fields } = useForm(pageSchema, {
    lastResult,
    defaultValue: defaultValue,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  const bodyRef = useRef("");

  return (
    <Form id={form.id}
      // onSubmit={handleSubmit}
      method="post" className="space-y-6">
      {form.errors?.map((error) => (
        <p key={error} className="text-sm text-destructive">
          {error}
        </p>
      ))}
      <div className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor={fields.title.id}>タイトル</Label>
          <Input
            id={fields.title.id}
            name={fields.title.name}
            defaultValue={fields.title.defaultValue}
            placeholder="例：標準レイアウト"
            aria-invalid={!fields.title.valid || undefined}
            aria-describedby={fields.title.ariaDescribedBy}
            type="text"
            required
          />
          <p className="text-sm text-destructive">
            {fields.title.errors}
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor={fields.slug.id}>Slug</Label>
          <Input
            id={fields.slug.id}
            name={fields.slug.name}
            defaultValue={fields.slug.defaultValue}
            placeholder="例：標準レイアウト"
            aria-invalid={!fields.slug.valid || undefined}
            aria-describedby={fields.slug.ariaDescribedBy}
            type="text"
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
            value={layoutId}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
            onChange={e => (setLayoutId(e.target.value))}
          >
            <option value="">Layoutを選択してください</option>
            {layouts.map((layout) => (
              <option key={layout.id} value={layout.id}>
                {layout.name}
              </option>
            ))}
          </select>
        </div>
        {layoutId &&
          layouts
            .find((layout) => layout.id === layoutId)
            ?.attributes.map((attribute, index) => (
              <div key={attribute.id} className="space-y-2">
                <Label>
                  {attribute.name} {attribute.valueType}
                </Label>
                <p>{attribute.description}</p>

                <AttributeField
                  index={index}
                  attribute={attribute}
                  defaultValue={defaultValue}
                />
              </div>
            ))}

        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
function AttributeField({
  index,
  attribute,
  defaultValue,
}: {
  index: number,
  attribute: LayoutWithAttributes["attributes"][number];
  defaultValue: PageFormProps["defaultValue"];
}) {
  const attributeValue = defaultValue.attributeValues.find(item => item.attributeId === attribute.id)
  let defaultAttributeValue = ""
  switch (attribute.valueType) {
    case "number":
      defaultAttributeValue = attributeValue?.valueInteger?.toString() || ""
      break

    case "text":
      defaultAttributeValue = attributeValue?.valueText?.toString() || ""
      break

    case "html":
      defaultAttributeValue = attributeValue?.valueText?.toString() || ""
      break

    case "markdown":
      defaultAttributeValue = attributeValue?.valueText?.toString() || ""
      break
    default:
      break
  }

  const [body, setBody] = useState(
    defaultAttributeValue
  );

  const inputName = `attributes[${index}].value`

  const attributeIdInput = <><input
    type="hidden"
    name={`attributes[${index}].attributeId`}
    value={attribute.id}
  /><input
    type="hidden"
    name={`attributes[${index}].attributeValueId`}
    value={attributeValue?.id}
  />
</>
  switch (attribute.valueType) {
    case "number":
      return (
        <>
          <div className="w-full max-w-48">
            <NumberField
              defaultValue={Number(body || 5)}
              min={0}
              max={100}
            >
              <NumberFieldGroup>
                <NumberFieldDecrement />
                <NumberFieldInput
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                />
                <NumberFieldIncrement />
              </NumberFieldGroup>
            </NumberField>
          </div>
          <input
            type="hidden"
            name={inputName}
            value={body}
          />
          {attributeIdInput}
        </>
      );

    case "text":
      return (
        <>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
          />
          <input type="hidden" name={inputName} value={body} />
          {attributeIdInput}
        </>
      );

    case "html":
      return (
        <>
          <HtmlEditor value={body} onChange={setBody} />
          <input type="hidden" name={inputName} value={body} />
          {attributeIdInput}
        </>
      );

    case "markdown":
      return (
        <>
          <CodeMirrorMarkdownEditor
            value={body}
            onChange={setBody}
          />
          <input type="hidden" name={inputName} value={body} />
          {attributeIdInput}
        </>
      );

    default:
      return <p>未知のタイプです。</p>;
  }
}