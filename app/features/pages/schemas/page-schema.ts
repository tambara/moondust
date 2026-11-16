import { z } from "zod";
import type { getLayoutsWithAttributes, getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";
export type LayoutWithAttributes = Awaited<ReturnType<typeof getLayoutsWithAttributes>>[number];

export const pageSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  slug: z.string().trim().min(1, "Slugは必須です"),
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
