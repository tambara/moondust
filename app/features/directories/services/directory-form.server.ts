import { parseSubmission, report } from "@conform-to/react/future";
import { getLayoutWithAttributes } from "~/features/layouts/services/layout-service.server";
import { createDirectorySchemaWithAttributeValues, directorySchema } from "../schemas/directory-schema";
import type { createDb } from "~/db";

type Database = ReturnType<typeof createDb>;

export async function parseDirectoryForm(
  db: Database,
  formData: FormData,
) {

  console.log("!!!!!!!!!!!!!!!!!!!!!!!!!")
  console.log(formData)

  const submission = parseSubmission(formData);

  // 基本項目の検証
  const directoryResult = directorySchema.safeParse(submission.payload);

  if (!directoryResult.success) {
    return {
      success: false as const,
      result: report(submission, {
        error: {
          issues: directoryResult.error.issues,
        },
      }),
    };
  }

  // Layoutの取得
  const layoutItem = await getLayoutWithAttributes(
    db,
    directoryResult.data.layoutId,
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
  const schema = createDirectorySchemaWithAttributeValues(layoutItem);
  const result = schema.safeParse(submission.payload);

  if (!result.success) {
    console.log(result.error.issues)
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
