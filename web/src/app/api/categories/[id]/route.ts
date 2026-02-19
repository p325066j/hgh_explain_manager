import { NextRequest, NextResponse } from "next/server";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { categoryUpdateSchema } from "@/lib/validators";

type Params = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_: NextRequest, { params }: Params) {
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
  return NextResponse.json(category);
}

export async function PATCH(req: NextRequest, { params }: Params) {
  const json = await req.json().catch(() => ({}));
  const parsed = categoryUpdateSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { message: "invalid payload", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }

  try {
    const { id } = await params;
    const updated = await prisma.category.update({
      where: { id },
      data: parsed.data,
    });
    await logAudit({
      action: "UPDATE",
      entityType: "CATEGORY",
      entityId: updated.id,
      message: "API からカテゴリを更新しました。",
      meta: parsed.data,
    });
    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
}

export async function DELETE(_: NextRequest, { params }: Params) {
  try {
    const { id } = await params;
    const deleted = await prisma.category.delete({ where: { id } });
    await logAudit({
      action: "DELETE",
      entityType: "CATEGORY",
      entityId: deleted.id,
      message: "API からカテゴリを削除しました。",
      meta: { name: deleted.name, slug: deleted.slug },
    });
    return NextResponse.json(deleted);
  } catch {
    return NextResponse.json({ message: "not found" }, { status: 404 });
  }
}
