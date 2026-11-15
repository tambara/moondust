import { z } from "zod";

export const attributeSchema = z.object({
  // name: z.string().trim().min(1, "名前は必須です"),
});