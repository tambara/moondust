import { z } from "zod";

export const scriptSchema = z.object({
  name: z.string().trim().min(1, "タイトルは必須です"),
  body: z.string().default(""),
});