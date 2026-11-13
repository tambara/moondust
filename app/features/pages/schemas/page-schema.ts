import { z } from "zod";

export const pageSchema = z.object({
  title: z.string().trim().min(1, "タイトルは必須です"),
  slug: z.string().trim().min(1, "Slugは必須です"),
  body: z.string().default(""),
  layoutId: z.string().optional(),
});