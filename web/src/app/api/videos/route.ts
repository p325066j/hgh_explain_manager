import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";
import { requireStaffApiRateLimit } from "@/lib/staff-api-rate-limit";
import { logAudit } from "@/lib/audit";
import { requireStaffApiAuth } from "@/lib/staff-auth";
import { videoCreateSchema } from "@/lib/validators";

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

export async function GET(req: NextRequest) {
  const unauthorized = await requireStaffApiAuth(req);
  if (unauthorized) return unauthorized;
  const rateLimited = await requireStaffApiRateLimit(req, { maxRequests: 120, windowMs: 60 * 1000 });
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const q = searchParams.get("q")?.trim() ?? undefined;
  const isVisibleParam = searchParams.get("isVisible");
  const isVisible =
    isVisibleParam === "true" ? true : isVisibleParam === "false" ? false : undefined;

  const where: Prisma.VideoWhereInput = {};
  if (typeof isVisible === "boolean") where.isVisible = isVisible;
  if (categoryId) {
    where.videoCategories = { some: { categoryId } };
  }
  if (q) {
    where.OR = [{ title: { contains: q } }, { description: { contains: q } }];
  }

  const videos = await prisma.video.findMany({
    where,
    include: {
      videoCategories: { include: { category: true }, orderBy: { order: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireStaffApiAuth(req);
  if (unauthorized) return unauthorized;
  const rateLimited = await requireStaffApiRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000 });
  if (rateLimited) return rateLimited;

  const json = await req.json().catch(() => ({}));
  const parsed = videoCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const videoId = extractYouTubeId(data.fileUrl);
  if (!videoId) {
    return NextResponse.json({ message: "invalid YouTube URL" }, { status: 400 });
  }

  const created = await prisma.video.create({
    data: {
      id: videoId,
      title: data.title,
      description: data.description,
      procedures: (data.procedures ?? []).join(", "),
      duration: data.duration,
      isVisible: data.isVisible,
      isVisibilityDirty: true,
      visibilitySyncStatus: "PENDING",
      fileUrl: data.fileUrl,
      thumbnailUrl: data.thumbnailUrl ?? undefined,
      videoCategories: {
        create: [{ categoryId: data.categoryId, order: 0 }],
      },
    },
    include: {
      videoCategories: { include: { category: true }, orderBy: { order: "asc" } },
    },
  });

  await logAudit({
    action: "CREATE",
    entityType: "VIDEO",
    entityId: created.id,
    message: "API から動画を登録しました。",
    meta: { isVisible: data.isVisible, categoryId: data.categoryId },
  });

  return NextResponse.json(created, { status: 201 });
}
