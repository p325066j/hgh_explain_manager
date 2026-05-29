import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { requireStaffApiRateLimit } from "@/lib/staff-api-rate-limit";
import { prisma } from "@/lib/db";
import { requireStaffApiAuth } from "@/lib/staff-auth";
import { categoryCreateSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  const unauthorized = await requireStaffApiAuth(req);
  if (unauthorized) return unauthorized;
  const rateLimited = await requireStaffApiRateLimit(req, { maxRequests: 120, windowMs: 60 * 1000 });
  if (rateLimited) return rateLimited;

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
  });
  return NextResponse.json(categories);
}

export async function POST(req: NextRequest) {
  const unauthorized = await requireStaffApiAuth(req);
  if (unauthorized) return unauthorized;
  const rateLimited = await requireStaffApiRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000 });
  if (rateLimited) return rateLimited;

  const json = await req.json().catch(() => ({}));
  const parsed = categoryCreateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const data = parsed.data;
  const created = await prisma.category.create({ data });
  await logAudit({
    action: "CREATE",
    entityType: "CATEGORY",
    entityId: created.id,
    message: "API からカテゴリを追加しました。",
    meta: { name: created.name, slug: created.slug, order: created.order },
  });
  return NextResponse.json(created, { status: 201 });
}
