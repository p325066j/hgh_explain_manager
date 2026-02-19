import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/db";

type AuditInput = {
  action: "CREATE" | "UPDATE" | "DELETE" | "SYNC";
  entityType: "VIDEO" | "CATEGORY" | "VISIBILITY_SYNC";
  entityId: string;
  message?: string;
  meta?: Prisma.InputJsonValue;
};

export async function logAudit({
  action,
  entityType,
  entityId,
  message,
  meta,
}: AuditInput) {
  await prisma.auditLog.create({
    data: {
      action,
      entityType,
      entityId,
      message,
      meta,
    },
  });
}
