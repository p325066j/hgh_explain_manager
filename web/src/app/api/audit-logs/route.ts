import { NextRequest, NextResponse } from "next/server";
import { AuditAction, AuditEntityType, Prisma } from "@prisma/client";
import { requireStaffApiRateLimit } from "@/lib/staff-api-rate-limit";
import { prisma } from "@/lib/db";
import { requireStaffApiAuth } from "@/lib/staff-auth";

const entityTypes = [
  AuditEntityType.VIDEO,
  AuditEntityType.CATEGORY,
  AuditEntityType.VISIBILITY_SYNC,
] as const;

const actions = [
  AuditAction.CREATE,
  AuditAction.UPDATE,
  AuditAction.DELETE,
  AuditAction.SYNC,
] as const;

const toEntityType = (value?: string) =>
  entityTypes.find((item) => item === value);

const toAction = (value?: string) => actions.find((item) => item === value);

export async function GET(req: NextRequest) {
  const unauthorized = await requireStaffApiAuth(req);
  if (unauthorized) return unauthorized;
  const rateLimited = await requireStaffApiRateLimit(req, { maxRequests: 30, windowMs: 60 * 1000 });
  if (rateLimited) return rateLimited;

  const { searchParams } = new URL(req.url);
  const entityType = toEntityType(searchParams.get("entityType") ?? undefined);
  const action = toAction(searchParams.get("action") ?? undefined);
  const entityId = searchParams.get("entityId")?.trim() ?? undefined;

  const limitParam = Number(searchParams.get("limit"));
  const take = Number.isFinite(limitParam)
    ? Math.min(Math.max(limitParam, 1), 200)
    : 50;

  const where: Prisma.AuditLogWhereInput = {};
  if (entityType) where.entityType = entityType;
  if (action) where.action = action;
  if (entityId) where.entityId = { contains: entityId };

  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take,
  });

  return NextResponse.json({ logs, count: logs.length });
}
