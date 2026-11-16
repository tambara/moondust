import { z } from "zod";
import { valueTypes } from "~/db/schema";
import { coerceFormValue } from '@conform-to/zod/v4/future';

export const layoutAttributeSchema = z.object({
  id: z.uuid().nullish(),
  label: z
    .string()
    .min(1, "ラベルは必須です")
  ,
  name: z.string().min(1, "名前は必須です").regex(/^[A-Za-z_-]+$/, "半角英字・アンダースコア・ハイフンのみ入力できます"),
  position: z.number().int().min(0),
  description: z.string().nullish(),
  valueType: z.enum(valueTypes),
});

const _layoutSchema = z.object({
  name: z.string().trim().min(1, "名前は必須です"),
  body: z.string().trim().min(1, "内容は必須です"),
  contentType: z.string().trim().min(1, "content-typeは必須です"),
  attributes: z.array(layoutAttributeSchema),
});

export const layoutSchema = coerceFormValue(
  _layoutSchema);

export type Layout = z.infer<typeof layoutSchema>;
export type LayoutAttribute = z.infer<typeof layoutAttributeSchema>;