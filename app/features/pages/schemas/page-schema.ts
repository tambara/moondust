import { z } from "zod";
import type { getLayoutsWithAttributes, getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";

// Date型をString型へ
export type DateToString<T> = {
  [K in keyof T]: T[K] extends Date
    ? string
    : T[K] extends object
      ? DateToString<T[K]>
      : T[K];
};


export type LayoutWithAttributes = DateToString<Awaited<ReturnType<typeof getLayoutsWithAttributes>>[number]>;

export const pageSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  path: z.string().trim()
    .min(1, "Pathは必須です")
    .max(255)
    .regex(/^[a-zA-Z0-9._~/-]+$/),
  layoutId: z.string().min(1, "Layoutは必須です"),
  attributes: z.array(
    z.object({
      attributeValueId: z.uuid().nullish(),
      attributeId: z.uuid(),
      value: z.string(),
    })
  )
});
function createPageAttributesSchema(
  layout: NonNullable<Awaited<ReturnType<typeof getLayoutWithAttributes>>>
) {
  return z.array(
    z.object({
      attributeValueId: z.uuid().nullish(),
      attributeId: z.uuid(),
      value: z.string(),
    })
  ).superRefine((attributes, ctx) => {
    attributes.forEach((attribute, index) => {
      if (!layout.attributes.some((item) => item.id === attribute.attributeId)) {
        ctx.addIssue({
          code: "custom",
          path: [index, "attributeId"],
          message: "不正な属性IDです",
        });
      }
    });
  });
}

export function createPageSchemaWithAttributeValues(
  layout: NonNullable<Awaited<ReturnType<typeof getLayoutWithAttributes>>>
) {
  return pageSchema.extend({
    attributes: createPageAttributesSchema(layout),
  });
}
