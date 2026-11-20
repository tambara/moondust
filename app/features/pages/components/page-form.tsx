
import { useForm } from "@conform-to/react/future";
import { Input } from "~/components/ui/input";
import { CodeMirrorMarkdownEditor } from "@latentic/live-markdown";
import { useState } from "react";
import { pageSchema, type LayoutWithAttributes } from "../schemas/page-schema";
import { Form, useActionData, useNavigation } from "react-router";
import "@latentic/live-markdown/styles.css";
import { HtmlEditor } from "~/features/admin/components/html-editor";
import { Textarea } from "~/components/ui/textarea";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "~/components/ui/dialog";
import { BranchTree, type Branch } from "~/components/branch-tree/branch-tree";
import { NavArrowDown } from "iconoir-react";
import type { NotNull } from "drizzle-orm";

type PageFormProps = {
  defaultValue: {
    title: string;
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
  routes: {
    id: string;
    parentId: string | null;
    slug: string;
    pageId: string | null;
  }[],
  pageRoute: {
    id: string;
    parentId: string | null;
    slug: string;
    pageId: string | null;
  }[]

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
  routes,
  pageRoute,
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

  // const branches: Branch[] = [
  //   {
  //     id: "br-main",
  //     name: "/",
  //     state: "active",
  //     updatedAt: "2026-11-18T08:30:00Z",
  //   },
  //   {
  //     id: "br-staging",
  //     name: "blog",
  //     parent: "br-main",
  //     state: "active",
  //     updatedAt: "2026-11-17T14:12:00Z",
  //   },
  //   {
  //     id: "br-dev",
  //     name: "service",
  //     parent: "br-main",
  //     state: "idle",
  //     updatedAt: "2026-11-16T03:45:00Z",
  //   },
  //   {
  //     id: "br-feature-auth",
  //     name: "photos",
  //     parent: "br-dev",
  //     state: "active",
  //     updatedAt: "2026-11-18T06:05:00Z",
  //   },
  //   {
  //     id: "br-feature-search",
  //     name: "feature",
  //     parent: "br-dev",
  //     state: "suspended",
  //     updatedAt: "2026-11-10T11:20:00Z",
  //   },
  //   {
  //     id: "br-fix-migration",
  //     name: "fix",
  //     parent: "br-staging",
  //     state: "idle",
  //     updatedAt: "2026-11-14T09:00:00Z",
  //   },
  //   {
  //     id: "br-preview-pr-142",
  //     name: "preview",
  //     parent: "br-feature-auth",
  //     // state と updatedAt は省略可能なので、未設定のケースも入れています
  //   },
  //   {
  //     id: "br-old-experiment",
  //     name: "experiment",
  //     parent: "br-main",
  //     state: "suspended",
  //     updatedAt: "2026-09-02T00:00:00Z",
  //   },
  // ];
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

        <SlugField routes={routes} pageRoute={pageRoute} fields={fields} />
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

// type PageForm = ReturnType<typeof useForm<typeof pageSchema>>
// type PageFields = PageForm["fields"]

function SlugField({ routes, pageRoute, fields }: {
  routes: PageFormProps["routes"],
  pageRoute: PageFormProps["pageRoute"],
  fields: any
}) {

  function createCurrentPageRoutes(cr: typeof pageRoute[number], result:typeof routes[number][] = []) {
    const parent = routes.find(route => route.id === cr.parentId)
    if (parent) {
      return createCurrentPageRoutes(parent, [...result, cr])
    }
    return [...result, cr]
  }

  const currentPageRoutes = createCurrentPageRoutes(pageRoute[0])

  const currentRoute = pageRoute.length ? routes.find(route => route.id === pageRoute[0].id) : null
  const currentPaths: typeof currentRoute[] = []

  function f(cr: NonNullable<typeof currentRoute>) {
    const parent = routes.find(route => route.id === cr.parentId)
    if (parent) {
      f(parent)
    }
    currentPaths.push(cr)
  }

  if (currentRoute) {
    f(currentRoute)
  }

  const currentSlug = pageRoute.length ? pageRoute[0].slug : ""
  const currentPath = currentPaths.length ? currentPaths.slice(0, -1).map(item => item?.slug).join("/") : "/"
  const [path, setPath] = useState(currentPath);
  const [slugSelect, setSelectSlug] = useState(currentPath.length ? currentPath : "/");

  const branches: Branch[] = []
  function makeBranch(parentId: string|null) {
    const children = routes.filter(route => route.parentId === parentId)
    if (children.length) {
      for (const child of children) {
        branches.push({ id: child.id, name: child.slug, parent: parentId ?? "/" })
        makeBranch(child.id)
      }
    }
  }

    // branches.push({ id:brachRoute.id, name: brachRoute.slug, parent: "/" })
    makeBranch(null)

  // const branches: Branch[] = [{
  //   id: "/",
  //   name: "/",
  // }, ...routes.map(item => ({
  //   id: item.id,
  //   name: item.slug,
  // }))]
  const [resultPath, serResultPath] = useState([currentPath, currentSlug].join("/"))
  const [slug, setSlug] = useState(currentSlug)

  return <>
 currentPageRoutes:  {currentPageRoutes.map(item=>item.slug).join("_/_")}
    <div className="flex items-center">
      <div className="font-mdedium">https://tambourin.me</div>
      <Dialog>
        <DialogTrigger render={<Button variant="ghost">{path}<NavArrowDown className="size-4 opacity-50" /></Button>} />
        <DialogContent>
          <DialogHeader>
            <DialogTitle>既存のルート</DialogTitle>
            <DialogDescription>
              すでに存在しているルートです。
            </DialogDescription>
          </DialogHeader>
          <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
            <BranchTree
              branches={branches}
              className="w-full"
              onValueChange={(id) => {
                function f(result: Branch[], current_id: string) {
                  const current = branches.find(item => item.id === current_id)
                  if (current) {
                    if (current.parent) {
                      f(result, current.parent)
                    }
                    result.push(current)
                  }
                }
                const result: Branch[] = []
                f(result, id)
                setSelectSlug(id)

                const names = result.map(item => item.name)
                const text = names.length <= 1
                  ? names.join("")
                  : names[0] + names.slice(1).join("/") + "/";

                setPath(text ?? "(エラー)")
                serResultPath([text, currentSlug].join("/"))
              }}
              value={slugSelect}
            />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="outline">キャンセル</Button>} />
            <DialogClose render={<Button variant="outline">OK</Button>} />
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <input type="hidden"
        id={fields.path.id}
        name={fields.path.name}
        value={resultPath} />
      <Input
        value={slug}
        defaultValue={slug}
        placeholder="例：blog/20010101"
        type="text"
        onChange={e => {
          setSlug(e.target.value)
          serResultPath([path, e.target.value].join("/"))
        }}
      />
    </div>
    <p className="text-sm text-destructive">
      {fields.path.errors}
    </p>
    <div>
      {resultPath}
    </div>
  </>
}