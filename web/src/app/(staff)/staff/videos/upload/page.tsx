import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import {
  formatMaxUploadSizeLabel,
  getVideoUploadMaxBytes,
  validateVideoUploadFile,
} from "@/lib/video-upload-limits";
import { uploadYouTubeVideo } from "@/lib/youtube";
import { videoUploadSchema } from "@/lib/validators";
import UploadForm from "./upload-form";

const extractThumbnailUrl = (thumbnails?: {
  default?: { url?: string | null } | null;
  medium?: { url?: string | null } | null;
  high?: { url?: string | null } | null;
}) => {
  return thumbnails?.high?.url || thumbnails?.medium?.url || thumbnails?.default?.url || null;
};

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

async function uploadVideo(formData: FormData): Promise<FormState> {
  "use server";
  const entries = Array.from(formData.entries()).map(([key, value]) => [
    key,
    typeof value === "string" ? value : "",
  ]) as Array<[string, string]>;
  const raw = Object.fromEntries(entries) as Record<string, string>;
  const parsed = videoUploadSchema.safeParse(raw);
  const file = formData.get("file");

  if (!parsed.success) {
    return {
      ok: false,
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }

  if (!(file instanceof File)) {
    return {
      ok: false,
      message: "動画ファイルを選択してください。",
      fieldErrors: { file: ["動画ファイルを選択してください。"] },
      values: raw,
    };
  }

  const fileValidation = await validateVideoUploadFile(file);
  if (!fileValidation.ok) {
    return {
      ok: false,
      message: fileValidation.message,
      fieldErrors: fileValidation.fieldErrors,
      values: raw,
    };
  }

  const data = parsed.data;

  try {
    const uploadResult = await uploadYouTubeVideo({
      file,
      contentType: fileValidation.contentType,
      title: data.title,
      description: data.description,
      youtubeCategoryId: data.youtubeCategoryId ?? undefined,
      privacyStatus: "public",
    });

    const videoId = uploadResult.id;
    if (!videoId) {
      return {
        ok: false,
        message: "YouTubeへのアップロードに失敗しました。動画IDが取得できません。",
        values: raw,
      };
    }

    const fileUrl = `https://www.youtube.com/watch?v=${videoId}`;
    const thumbnailUrl = extractThumbnailUrl(uploadResult.snippet?.thumbnails ?? undefined);

    await prisma.video.create({
      data: {
        id: videoId,
        title: data.title,
        description: data.description,
        complications: data.complications ?? null,
        precautions: data.precautions ?? null,
        procedures: (data.procedures ?? []).join(", "),
        duration: data.duration,
        fileUrl,
        thumbnailUrl: thumbnailUrl ?? undefined,
        isVisible: data.isVisible,
        isVisibilityDirty: false,
        visibilitySyncStatus: "SUCCESS",
        visibilitySyncedAt: new Date(),
        visibilitySyncError: null,
        videoCategories: {
          create: [{ categoryId: data.categoryId, order: 0 }],
        },
      },
    });

    await logAudit({
      action: "CREATE",
      entityType: "VIDEO",
      entityId: videoId,
      message: "動画をアップロードしました。",
      meta: { source: "upload", categoryId: data.categoryId },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "この動画は既に登録されています。",
        values: raw,
      };
    }
    const message = error instanceof Error ? error.message : "アップロードに失敗しました。";
    return {
      ok: false,
      message,
      values: raw,
    };
  }

  revalidatePath("/staff");
  revalidatePath("/staff/videos");
  revalidatePath("/patient");
  redirect("/staff/videos");
}

export default async function StaffVideoUploadPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="ui-card-form grid gap-8">
      <header className="space-y-2">
        <h1 className="ui-title">動画アップロード</h1>
        <p className="text-sm text-slate-300">
          動画ファイルをYouTubeにアップロードし、アプリに登録します。
        </p>
      </header>

      <UploadForm
        categories={categories}
        action={uploadVideo}
        maxUploadBytes={getVideoUploadMaxBytes()}
        maxUploadSizeLabel={formatMaxUploadSizeLabel()}
      />
    </div>
  );
}
