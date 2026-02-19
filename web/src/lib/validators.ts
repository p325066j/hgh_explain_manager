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

export const categoryUpdateSchema = z.object({
  name: z.string().min(1).max(120).optional(),
  slug: z
    .string()
    .min(1)
    .max(120)
    .regex(/^[a-z0-9-]+$/i, "slugは英数字とハイフンのみ")
    .optional(),
  order: z.coerce.number().int().min(0).optional(),
});

const extractYouTubeId = (value: string) => {
  try {
    const url = new URL(value);
    if (url.hostname === "youtu.be") {
      return url.pathname.slice(1) || null;
    }
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") {
        return url.searchParams.get("v");
      }
      if (url.pathname.startsWith("/embed/")) {
        return url.pathname.split("/")[2] || null;
      }
    }
    return null;
  } catch {
    return null;
  }
};

const youTubeUrlSchema = z.preprocess(
  (value) => (typeof value === "string" ? value.trim() : value),
  z
    .string()
    .url()
    .refine((value) => {
      const id = extractYouTubeId(value);
      return Boolean(id && id.length === 11);
    }, "YouTube の動画 URL を入力してください"),
);

const booleanFromForm = z.preprocess((value) => {
  if (value === "true" || value === "on") return true;
  if (value === "false") return false;
  return value;
}, z.boolean());

export const videoCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
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
  isVisible: booleanFromForm.default(false),
  fileUrl: youTubeUrlSchema,
  thumbnailUrl: z.preprocess(
    (value) => (typeof value === "string" && value.trim() === "" ? undefined : value),
    z.string().url().optional(),
  ),
});

export const videoUploadSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(10_000),
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
  isVisible: booleanFromForm.default(true),
  youtubeCategoryId: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value && value.length > 0 ? value : undefined)),
});

export type VideoCreateInput = z.infer<typeof videoCreateSchema>;
export type VideoUploadInput = z.infer<typeof videoUploadSchema>;
export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;