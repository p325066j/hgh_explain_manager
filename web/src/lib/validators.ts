import { z } from "zod";

export const categoryCreateSchema = z.object({
  name: z.string().min(1).max(120),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "slugは英数字とハイフンのみ"),
  order: z.coerce.number().int().min(0).default(0),
});

export const videoVisibilityEnum = z.enum(["DRAFT", "IN_REVIEW", "PUBLISHED"]);

export const videoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(0).max(10_000).default(""),
  categoryId: z.string().min(1),
  procedures: z
    .string()
    .transform((s) =>
      s
        .split(",")
        .map((v) => v.trim())
        .filter(Boolean),
    )
    .optional()
    .default([]),
  duration: z.coerce.number().int().min(1).max(600).optional(),
  visibility: z
    .string()
    .optional()
    .transform((v) => (v ?? "DRAFT").toUpperCase())
    .pipe(videoVisibilityEnum)
    .default("DRAFT" as const),
});

export type VideoCreateInput = z.infer<typeof videoCreateSchema>;

