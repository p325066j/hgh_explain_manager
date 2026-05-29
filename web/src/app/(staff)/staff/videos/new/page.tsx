import { Prisma } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { videoCreateSchema } from "@/lib/validators";
import VideoForm from "./video-form";

const extractYouTubeId = (url: string) => {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === "youtu.be") {
      return parsed.pathname.slice(1) || null;
    }
    if (parsed.hostname.endsWith("youtube.com")) {
      if (parsed.pathname === "/watch") {
        return parsed.searchParams.get("v");
      }
      if (parsed.pathname.startsWith("/embed/")) {
        return parsed.pathname.split("/")[2] || null;
      }
    }
    return null;
  } catch {
    return null;
  }
};

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

async function createVideo(_: FormState, formData: FormData): Promise<FormState> {
  "use server";
  const entries = Array.from(formData.entries()).map(([key, value]) => [
    key,
    typeof value === "string" ? value : "",
  ]) as Array<[string, string]>;
  const raw = Object.fromEntries(entries) as Record<string, string>;
  const parsed = videoCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: raw,
    };
  }
  const data = parsed.data;
  const videoId = extractYouTubeId(data.fileUrl);
  if (!videoId) {
    return {
      ok: false,
      message: "YouTube の動画URLが正しくありません。",
      fieldErrors: { fileUrl: ["YouTube の動画URLを入力してください。"] },
      values: raw,
    };
  }

  try {
    await prisma.video.create({
      data: {
        id: videoId,
        title: data.title,
        description: data.description,
        complications: data.complications ?? null,
        precautions: data.precautions ?? null,
        isVisible: data.isVisible,
        isVisibilityDirty: true,
        visibilitySyncStatus: "PENDING",
        procedures: (data.procedures ?? []).join(", "),
        duration: data.duration,
        fileUrl: data.fileUrl,
        thumbnailUrl: data.thumbnailUrl ?? undefined,
        videoCategories: {
          create: [{ categoryId: data.categoryId, order: 0 }],
        },
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "この動画は既に登録されています。別のURLを入力してください。",
        fieldErrors: { fileUrl: ["この動画IDは既に使われています。"] },
        values: raw,
      };
    }
    throw error;
  }

  await logAudit({
    action: "CREATE",
    entityType: "VIDEO",
    entityId: videoId,
    message: "動画を手動登録しました。",
    meta: { isVisible: data.isVisible, categoryId: data.categoryId },
  });
  revalidatePath("/staff");
  revalidatePath("/staff/videos");
  redirect("/staff/videos");
}

export default async function StaffVideoNewPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="ui-card-form grid gap-8">
      <header className="space-y-2">
        <h1 className="ui-title">動画の手動登録</h1>
        <p className="text-sm text-white">
          YouTube のURLとメタ情報を入力して、動画を登録します。
        </p>
      </header>

      <VideoForm categories={categories} action={createVideo} />
    </div>
  );
}
