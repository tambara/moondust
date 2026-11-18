
import { useForm } from "@conform-to/react/future";
import { Button } from "~/components/area/button";
import { Input } from "~/components/ui/input";
import { CodeMirrorMarkdownEditor } from "@latentic/live-markdown";
import { useState } from "react";
import { pageSchema, type LayoutWithAttributes } from "../schemas/page-schema";
import { Form, useActionData, useNavigation } from "react-router";
import "@latentic/live-markdown/styles.css";
import { HtmlEditor } from "~/features/admin/components/html-editor";
import { Textarea } from "~/components/ui/textarea";
import { AutocompleteSelect, Select, SelectItem } from "~/components/area/Select";
import { ChevronDown, FileCode, FileJson, FileText, Settings2 } from "lucide-react";
import { Autocomplete, useFilter } from "react-aria-components/Autocomplete";
import { ListBox, ListBoxItem } from "~/components/area/ListBox";
import { Label, SelectValue } from "react-aria-components/Select";
import { SearchField } from "~/components/area/SearchField";
import { DialogTrigger } from "react-aria-components/Popover";
import { Switch } from "~/components/area/Switch";
import { Popover } from "~/components/area/Popover";
import { Menu, MenuItem, MenuSection, MenuTrigger } from "~/components/area/Menu";
import { TreeLoadMoreItem, type Selection } from "react-aria-components";
import { PathInput } from "~/features/admin/components/PathInput";
import { RouteInput } from "~/features/admin/components/RouteInput";
import { Tree, TreeItem } from "~/components/area/Tree";
import { Collection } from 'react-aria-components/Collection';
import { useAsyncList } from 'react-aria-components/useAsyncList';
import { TreeExpander, TreeIcon, TreeLabel, TreeNode, TreeNodeContent, TreeNodeTrigger, TreeProvider, TreeView } from "~/components/kibo-ui/tree";

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
interface Character {
  name: string
}


const starWars: Character[] = [
  { name: "Luke Skywalker" },
  { name: "Leia Organa" },
  { name: "Han Solo" },
  { name: "Obi-Wan Kenobi" },
  { name: "Darth Vader" },
  { name: "Yoda" },
  { name: "Chewbacca" },
  { name: "R2-D2" },
  { name: "C-3PO" },
  { name: "Lando Calrissian" },
];

const pokemons: Character[] = [
  { name: "Pikachu" },
  { name: "Charizard" },
  { name: "Bulbasaur" },
  { name: "Squirtle" },
  { name: "Eevee" },
  { name: "Snorlax" },
  { name: "Mewtwo" },
  { name: "Gengar" },
  { name: "Jigglypuff" },
  { name: "Psyduck" },
];
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
  const [slug, setSlug] = useState(defaultValue.slug);
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

  const starWarsList = useAsyncList<Character>({
    async load({ signal, filterText }) {
      // 通信待ちの再現(signal は fetch ではないので、ここでは未使用でOK)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const items = filterText
        ? starWars.filter((c) =>
          c.name.toLowerCase().includes(filterText.toLowerCase()),
        )
        : starWars;

      return { items };
    },
  });
  const pokemonList = useAsyncList<Character>({
    async load({ signal, filterText }) {
      // 通信待ちの再現(signal は fetch ではないので、ここでは未使用でOK)
      await new Promise((resolve) => setTimeout(resolve, 800));

      const items = filterText
        ? pokemons.filter((c) =>
          c.name.toLowerCase().includes(filterText.toLowerCase()),
        )
        : pokemons;

      return { items };
    },
  });
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
"
    <TreeProvider
      defaultExpandedIds={["src", "components", "ui"]}
      onSelectionChange={(ids) => console.log("Selected:", ids)}
    >
      <TreeView>
        <TreeNode nodeId="src">
          <TreeNodeTrigger>
            <TreeExpander hasChildren />
            <TreeIcon hasChildren />
            <TreeLabel>src</TreeLabel>
          </TreeNodeTrigger>
          <TreeNodeContent hasChildren>
            <TreeNode level={1} nodeId="components">
              <TreeNodeTrigger>
                <TreeExpander hasChildren />
                <TreeIcon hasChildren />
                <TreeLabel>components</TreeLabel>
              </TreeNodeTrigger>
              <TreeNodeContent hasChildren>
                <TreeNode level={2} nodeId="ui">
                  <TreeNodeTrigger>
                    <TreeExpander hasChildren />
                    <TreeIcon hasChildren />
                    <TreeLabel>ui</TreeLabel>
                  </TreeNodeTrigger>
                  <TreeNodeContent hasChildren>
                    <TreeNode level={3} nodeId="button.tsx">
                      <TreeNodeTrigger>
                        <TreeExpander />
                        <TreeIcon icon={<FileCode className="h-4 w-4" />} />
                        <TreeLabel>button.tsx</TreeLabel>
                      </TreeNodeTrigger>
                    </TreeNode>
                    <TreeNode level={3} nodeId="card.tsx">
                      <TreeNodeTrigger>
                        <TreeExpander />
                        <TreeIcon icon={<FileCode className="h-4 w-4" />} />
                        <TreeLabel>card.tsx</TreeLabel>
                      </TreeNodeTrigger>
                    </TreeNode>
                    <TreeNode isLast level={3} nodeId="dialog.tsx">
                      <TreeNodeTrigger>
                        <TreeExpander />
                        <TreeIcon icon={<FileCode className="h-4 w-4" />} />
                        <TreeLabel>dialog.tsx</TreeLabel>
                      </TreeNodeTrigger>
                    </TreeNode>
                  </TreeNodeContent>
                </TreeNode>
                <TreeNode isLast level={2} nodeId="layout">
                  <TreeNodeTrigger>
                    <TreeExpander hasChildren />
                    <TreeIcon hasChildren />
                    <TreeLabel>layout</TreeLabel>
                  </TreeNodeTrigger>
                  <TreeNodeContent hasChildren>
                    <TreeNode level={3} nodeId="header.tsx">
                      <TreeNodeTrigger>
                        <TreeExpander />
                        <TreeIcon icon={<FileCode className="h-4 w-4" />} />
                        <TreeLabel>header.tsx</TreeLabel>
                      </TreeNodeTrigger>
                    </TreeNode>
                    <TreeNode isLast level={3} nodeId="footer.tsx">
                      <TreeNodeTrigger>
                        <TreeExpander />
                        <TreeIcon icon={<FileCode className="h-4 w-4" />} />
                        <TreeLabel>footer.tsx</TreeLabel>
                      </TreeNodeTrigger>
                    </TreeNode>
                  </TreeNodeContent>
                </TreeNode>
              </TreeNodeContent>
            </TreeNode>
          </TreeNodeContent>
        </TreeNode>
        <TreeNode nodeId="public">
          <TreeNodeTrigger>
            <TreeExpander hasChildren />
            <TreeIcon hasChildren />
            <TreeLabel>public</TreeLabel>
          </TreeNodeTrigger>
          <TreeNodeContent hasChildren>
            <TreeNode isLast level={1} nodeId="images">
              <TreeNodeTrigger>
                <TreeExpander hasChildren />
                <TreeIcon hasChildren />
                <TreeLabel>images</TreeLabel>
              </TreeNodeTrigger>
              <TreeNodeContent hasChildren>
                <TreeNode level={2} nodeId="logo.svg">
                  <TreeNodeTrigger>
                    <TreeExpander />
                    <TreeIcon icon={<FileText className="h-4 w-4" />} />
                    <TreeLabel>logo.svg</TreeLabel>
                  </TreeNodeTrigger>
                </TreeNode>
                <TreeNode isLast level={2} nodeId="hero.png">
                  <TreeNodeTrigger>
                    <TreeExpander />
                    <TreeIcon icon={<FileText className="h-4 w-4" />} />
                    <TreeLabel>hero.png</TreeLabel>
                  </TreeNodeTrigger>
                </TreeNode>
              </TreeNodeContent>
            </TreeNode>
          </TreeNodeContent>
        </TreeNode>
        <TreeNode nodeId="package.json">
          <TreeNodeTrigger>
            <TreeExpander />
            <TreeIcon icon={<FileJson className="h-4 w-4" />} />
            <TreeLabel>package.json</TreeLabel>
          </TreeNodeTrigger>
        </TreeNode>
        <TreeNode nodeId="tsconfig.json">
          <TreeNodeTrigger>
            <TreeExpander />
            <TreeIcon icon={<FileJson className="h-4 w-4" />} />
            <TreeLabel>tsconfig.json</TreeLabel>
          </TreeNodeTrigger>
        </TreeNode>
        <TreeNode isLast nodeId="README.md">
          <TreeNodeTrigger>
            <TreeExpander />
            <TreeIcon icon={<FileText className="h-4 w-4" />} />
            <TreeLabel>README.md</TreeLabel>
          </TreeNodeTrigger>
        </TreeNode>
      </TreeView>
    </TreeProvider>

          <RouteInput
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
            ?.attributes.sort((a, b) => a.position - b.position).map((attribute, index) => (
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

        <Button type="submit" isPending={submitting} isDisabled={submitting}>
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
  />
    {attributeValue?.id ?
      <input
        type="hidden"
        name={`attributes[${index}].attributeValueId`}
        value={attributeValue?.id}
      />
      : <></>
    }
  </>
  switch (attribute.valueType) {
    case "number":
      return (
        <>
          <div className="w-full max-w-48">
            {/* <NumberField
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
            </NumberField> */}
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