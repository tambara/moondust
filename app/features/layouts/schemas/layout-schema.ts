import { z } from "zod";
import { valueTypes } from "~/db/schema";
import { coerceFormValue } from '@conform-to/zod/v4/future';

export const layoutAttributeSchema = z.object({
  name: z.string().min(1, "名前は必須です"),
  valueType: z.enum(valueTypes),
});

export const _layoutSchema = z.object({
  name: z.string().trim().min(1, "名前は必須です"),
  body: z.string().trim().min(1, "内容は必須です"),
  attributes: z.array(layoutAttributeSchema),
});

export const layoutSchema = coerceFormValue(
_layoutSchema);

export type Layout = z.infer<typeof layoutSchema>;
export type LayoutAttribute = z.infer<typeof layoutAttributeSchema>;