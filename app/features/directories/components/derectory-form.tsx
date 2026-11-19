
import { useForm } from "@conform-to/react/future";
import { Input } from "~/components/ui/input";
import { CodeMirrorMarkdownEditor } from "@latentic/live-markdown";
import { useState } from "react";
import { directorySchema, type LayoutWithAttributes } from "../schemas/directory-schema";
import { Form, useActionData, useNavigation } from "react-router";
import "@latentic/live-markdown/styles.css";
import { HtmlEditor } from "~/features/admin/components/html-editor";
import { Textarea } from "~/components/ui/textarea";
import { ChevronDown, Settings2 } from "lucide-react";
import { Label } from "~/components/ui/label";
import { Button } from "~/components/ui/button";

type DirectoryFormProps = {
  defaultValue: {
    path: string;
  };

  routes: {
    id: string;
    parentId: string;
    // description: string;
    pageId: string;
    name: string;
  }[],
  submitLabel?: string;
};

export function DirectoryForm({
  defaultValue,
  routes,
  submitLabel = "保存",
}: DirectoryFormProps) {
  // const [body, setBody] = useState(fields.body.value ?? "");
  const lastResult = useActionData();
  const navigation = useNavigation();
  const submitting = navigation.state === "submitting";

  const { form, fields } = useForm(directorySchema, {
    lastResult,
    defaultValue: defaultValue,
    shouldValidate: "onBlur",
    shouldRevalidate: "onInput",
  });
  const [slug, setSlug] = useState(defaultValue.path);
  const [selectedItems, setSelectedItems] = useState<typeof states>([]);

  const states = [
    { id: 'AL', name: 'Alabama' },
    { id: 'AK', name: 'Alaska' },
    { id: 'AZ', name: 'Arizona' },
    { id: 'AR', name: 'Arkansas' },
    { id: 'CA', name: 'California' },
    { id: 'CO', name: 'Colorado' },
    { id: 'CT', name: 'Connecticut' },
    { id: 'DE', name: 'Delaware' },
    { id: 'DC', name: 'District of Columbia' },
    { id: 'FL', name: 'Florida' },
    { id: 'GA', name: 'Georgia' },
    { id: 'HI', name: 'Hawaii' },
    { id: 'ID', name: 'Idaho' },
    { id: 'IL', name: 'Illinois' },
    { id: 'IN', name: 'Indiana' },
    { id: 'IA', name: 'Iowa' },
    { id: 'KS', name: 'Kansas' },
    { id: 'KY', name: 'Kentucky' },
    { id: 'LA', name: 'Louisiana' },
    { id: 'ME', name: 'Maine' },
    { id: 'MD', name: 'Maryland' },
    { id: 'MA', name: 'Massachusetts' },
    { id: 'MI', name: 'Michigan' },
    { id: 'MN', name: 'Minnesota' },
    { id: 'MS', name: 'Mississippi' },
    { id: 'MO', name: 'Missouri' },
    { id: 'MT', name: 'Montana' },
    { id: 'NE', name: 'Nebraska' },
    { id: 'NV', name: 'Nevada' },
    { id: 'NH', name: 'New Hampshire' },
    { id: 'NJ', name: 'New Jersey' },
    { id: 'NM', name: 'New Mexico' },
    { id: 'NY', name: 'New York' },
    { id: 'NC', name: 'North Carolina' },
    { id: 'ND', name: 'North Dakota' },
    { id: 'OH', name: 'Ohio' },
    { id: 'OK', name: 'Oklahoma' },
    { id: 'OR', name: 'Oregon' },
    { id: 'PA', name: 'Pennsylvania' },
    { id: 'RI', name: 'Rhode Island' },
    { id: 'SC', name: 'South Carolina' },
    { id: 'SD', name: 'South Dakota' },
    { id: 'TN', name: 'Tennessee' },
    { id: 'TX', name: 'Texas' },
    { id: 'UT', name: 'Utah' },
    { id: 'VT', name: 'Vermont' },
    { id: 'VA', name: 'Virginia' },
    { id: 'WA', name: 'Washington' },
    { id: 'WV', name: 'West Virginia' },
    { id: 'WI', name: 'Wisconsin' },
    { id: 'WY', name: 'Wyoming' }
  ];
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
          <Label htmlFor={fields.path.id}>パス</Label>
          <Input
            id={fields.path.id}
            name={fields.path.name}
            defaultValue={fields.path.defaultValue}
            placeholder="例：/posts/technology"
            aria-invalid={!fields.path.valid || undefined}
            aria-describedby={fields.path.ariaDescribedBy}
            type="text"
            required
          />
          <p className="text-sm text-destructive">
            {fields.path.errors}
          </p>
        </div>

        <div className="space-y-2">
          {/*     
              <PathInput
                items={states}
                selectedItems={selectedItems}
                onSelectedItemsChange={setSelectedItems}
                getKey={item => item.id}
                getLabel={item => item.name}
                value={slug}
                onValueChange={setSlug}
                segmentsName="routes"
                id={fields.slug.id}
                name={fields.slug.name}
                placeholder="例：標準レイアウト"
                required
              />
     */}
          <p className="text-sm text-destructive">
            {fields.path.errors}
          </p>
        </div>

        <Button type="submit" disabled={submitting}>
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>
    </Form>
  );
}