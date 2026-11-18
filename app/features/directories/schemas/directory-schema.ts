import { z } from "zod";
import type { getLayoutsWithAttributes, getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";
export type LayoutWithAttributes = Awaited<ReturnType<typeof getLayoutsWithAttributes>>[number];

export const directorySchema = z.object({
  path: z.string().trim().min(1, "Slugは必須です"),
});
function createDirectoryAttributesSchema(
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

export function createDirectorySchemaWithAttributeValues(
  layout: NonNullable<Awaited<ReturnType<typeof getLayoutWithAttributes>>>
) {
  return directorySchema.extend({
    attributes: createDirectoryAttributesSchema(layout),
  });
}
