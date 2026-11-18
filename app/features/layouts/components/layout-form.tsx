
import { useForm } from '@conform-to/react/future';

import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { HtmlEditor } from "~/features/admin/components/html-editor";
import { useState } from "react";
import { Form, useActionData, useLoaderData, useNavigation } from "react-router";
import { layoutAttributeSchema, layoutSchema } from "../schemas/layout-schema";
import { valueTypes } from "~/db/schema";
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card';
import { Button } from '~/components/area/button';


type AttributeProps = {
  id: string,
  name: string;
  label: string,
  description: string,
  position: number,
  valueType: typeof valueTypes[number];
};

type LayoutFormProps = {
  defaultValue: {
    name: string;
    body: string;
    contentType:string;
    attributes: Array<AttributeProps>,
  };
  submitLabel?: string;
};


export function LayoutForm({
  defaultValue,
  submitLabel = "保存",
}: LayoutFormProps) {


  const {mimeTypes } = useLoaderData()




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
  const attributes = fields.attributes.getFieldList();

  type FirstAttributeProps = Omit<AttributeProps, "id" | "valueType"> & {
    valueType: AttributeProps["valueType"] | "";
  };

  const [firstAttribute, setFirstAttribute] = useState<FirstAttributeProps>({
    label: "",
    description: "",
    name: "",
    valueType: "",
    position: 0,
  });

  return (

    <Form {...form.props} id={form.id}
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
          <Label htmlFor={fields.contentType.id}>Content-type</Label>
          <select
            defaultValue={fields.contentType.defaultValue}
            name={fields.contentType.name}
            className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            {mimeTypes.map((type:{label:string, value:string},index:number) => (
              <option key={index} value={type.value}>
                {type.label}({type.value})
              </option>
            ))}
          </select>
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
            <Label >フィールド</Label>
            <div className="bg-gray-100 p-3 rounded-xl text-sm">
              すでに追加されているフィールドを削除して同名で追加しても新規フィールドとして扱われるため、すでにページにおいてそのフィールドに保存されたデータは消去されることをご注意ください。

            </div>
            {/* 最初のInput */}
            <div className="flex gap-1">
              <Input
                type="text"
                placeholder="例：お名前（ラベル名）"
                value={firstAttribute.label}
                onChange={(e) => {
                  setFirstAttribute((prev) => ({
                    ...prev,
                    label: e.target.value,
                  }))
                }
                }
              />
              <Input
                type="text"
                placeholder="例：お名前を保存するフィールドです。（説明）"
                value={firstAttribute.description}
                onChange={(e) => {
                  setFirstAttribute((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                }
              />

              <Input
                type="text"
                placeholder="例：name（変数名）"
                value={firstAttribute.name}
                onChange={(e) => {
                  setFirstAttribute((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
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
                isDisabled={!layoutAttributeSchema.safeParse(firstAttribute).success}
                onClick={() => {
                  intent.insert({
                    name: fields.attributes.name,
                    defaultValue: firstAttribute as AttributeProps
                  })
                  setFirstAttribute({
                    label: "",
                    description: "",
                    name: "",
                    valueType: "",
                    position: 0,

                  })
                }
                }
              >
                ＋ 追加
              </Button>
            </div>
            <div>
              <pre className='text-xs bg-gray-100 p-3'>
                {JSON.stringify(
                  layoutAttributeSchema.safeParse(firstAttribute).error?.issues,
                  null,
                  2
                )}</pre>
            </div>


            {/* 追加分 */}
            <Card>
              <CardHeader>
                <CardTitle>現在</CardTitle>
              </CardHeader>
              {/* TODO: 削除は明確に削除として渡す */}
              <CardContent className="space-y-4">
                <div className="divide-y">
                  {attributes.sort((a, b) => Number.parseInt(a.getFieldset().position.defaultValue)
                    - Number.parseInt(b.getFieldset().position.defaultValue)).map((item, index) => {
                      const attributeFields = item.getFieldset();
                      return <div
                        key={index}
                        className="flex flex-col justify-between gap-3 py-4 sm:flex-row sm:items-center"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="" key={item.key}>
                            <div className="font-bold">{attributeFields.label.defaultValue}</div>
                            <div className="text-xs">ID：{attributeFields.id?.defaultValue?.length ? attributeFields.id.defaultValue : "新規"}</div>
                            <div className="text-xs">変数名：{attributeFields.name.defaultValue}</div>
                            <div className="text-xs">タイプ：{attributeFields.valueType.defaultValue}</div>
                            <div className="text-xs">説明：{attributeFields.description.defaultValue}</div>
                            <div className="text-xs">位置：{attributeFields.position.defaultValue}</div>
                            <input
                              type="hidden"
                              value={attributeFields.label.defaultValue}
                              id={attributeFields.label.id}
                              name={attributeFields.label.name}
                            />
                            <input
                              type="hidden"
                              value={attributeFields.name.defaultValue}
                              id={attributeFields.name.id}
                              name={attributeFields.name.name}
                            />
                            <input
                              type="hidden"
                              value={attributeFields.description.defaultValue}
                              id={attributeFields.description.id}
                              name={attributeFields.description.name}
                            />
                            <input
                              type="hidden"
                              value={attributeFields.valueType.defaultValue}
                              id={attributeFields.valueType.id}
                              name={attributeFields.valueType.name}
                            />
                            <input
                              type="hidden"
                              value={attributeFields.position.defaultValue}
                              id={attributeFields.position.id}
                              name={attributeFields.position.name}
                            />
                            {attributeFields?.id?.defaultValue?.length ?
                              <input
                                type="hidden"
                                value={attributeFields.id.defaultValue}
                                id={attributeFields.id.id}
                                name={attributeFields.id.name}
                              /> : ""
                            }
                          </div>                              </div>

                        <div className="flex gap-2">
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
                      </div>
                    })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
        <Button type="submit" isPending={submitting}>
          {submitting ? "保存中..." : submitLabel}
        </Button>
      </div>
    </Form>
  );
}
