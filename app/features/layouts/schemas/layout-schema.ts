import { z } from "zod";

export const layoutSchema = z.object({
  name: z.string().trim().min(1, "名前は必須です"),
  body: z.string().trim().min(1, "内容は必須です"),
});