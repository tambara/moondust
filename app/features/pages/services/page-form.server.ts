import { parseSubmission, report } from "@conform-to/react/future";
import { getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";
import { createPageSchemaWithAttributeValues, pageSchema } from "../schemas/page-schema";
import type { createDb } from "~/db";

type Database = ReturnType<typeof createDb>;

export async function parsePageForm(
  db: Database,
  formData: FormData,
) {
  const submission = parseSubmission(formData);

  // 基本項目の検証
  const pageResult = pageSchema.safeParse(submission.payload);

  if (!pageResult.success) {
    return {
      success: false as const,
      result: report(submission, {
        error: {
          issues: pageResult.error.issues,
        },
      }),
    };
  }

  // Layoutの取得
  const layoutItem = await getLayoutWithAttributes(
    db,
    pageResult.data.layoutId,
  );

  if (!layoutItem) {
    return {
      success: false as const,
      result: report(submission, {
        error: {
          fieldErrors: {
            layoutId: ["そのレイアウトは存在しません。"],
          },
        },
      }),
    };
  }

  // Layoutに応じた属性の検証
  const schema = createPageSchemaWithAttributeValues(layoutItem);
  const result = schema.safeParse(submission.payload);

  if (!result.success) {
    return {
      success: false as const,
      result: report(submission, {
        error: {
          issues: result.error.issues,
        },
      }),
    };
  }

  return {
    success: true as const,
    data: result.data,
    layoutItem,
  };
}
