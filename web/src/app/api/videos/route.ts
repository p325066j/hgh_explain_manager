import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { videoVisibilityEnum } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const categoryId = searchParams.get("categoryId") ?? undefined;
  const q = searchParams.get("q")?.trim() ?? undefined;
  const visibility = searchParams.get("visibility")?.toUpperCase();

  const where: any = {};
  if (categoryId) where.categoryId = categoryId;
  if (visibility && videoVisibilityEnum.safeParse(visibility).success)
    where.visibility = visibility as any;
  if (q) where.title = { contains: q };

  const videos = await prisma.video.findMany({
    where,
    orderBy: { updatedAt: "desc" },
  });
  return NextResponse.json(videos);
}

export async function POST(req: NextRequest) {
  // このエンドポイントは将来的に multipart 対応予定。MVPではJSON想定。
  const json = await req.json().catch(() => ({}));
  const title = String(json.title ?? "");
  const description = String(json.description ?? "");
  const categoryId = String(json.categoryId ?? "");
  const procedures: string[] = Array.isArray(json.procedures)
    ? json.procedures.map((v: unknown) => String(v))
    : typeof json.procedures === "string"
      ? String(json.procedures)
          .split(",")
          .map((v: string) => v.trim())
          .filter(Boolean)
      : [];
  const duration = json.duration != null ? Number(json.duration) : null;
  const visibility = String(json.visibility ?? "DRAFT").toUpperCase();
  const fileUrl = String(json.fileUrl ?? "/videos/placeholder.mp4");
  const thumbnailUrl = json.thumbnailUrl ? String(json.thumbnailUrl) : null;

  if (!title || !categoryId) {
    return NextResponse.json({ message: "title, categoryIdは必須" }, { status: 400 });
  }
  if (!videoVisibilityEnum.safeParse(visibility).success) {
    return NextResponse.json({ message: "visibilityが不正" }, { status: 400 });
  }

  const created = await prisma.video.create({
    data: {
      title,
      description,
      categoryId,
      procedures: procedures.join(", "),
      duration: duration ?? undefined,
      visibility: visibility as any,
      fileUrl,
      thumbnailUrl: thumbnailUrl ?? undefined,
    },
  });
  return NextResponse.json(created, { status: 201 });
}
