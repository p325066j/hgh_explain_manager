import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import { categoryCreateSchema, categoryUpdateSchema } from "@/lib/validators";
import CategoryOrderList from "./category-order-list";
import CreateCategoryForm from "./create-category-form";

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

async function createCategory(formData: FormData): Promise<FormState> {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const parsed = categoryCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return {
      ok: false,
      message: "入力内容を確認してください。",
      fieldErrors: parsed.error.flatten().fieldErrors,
      values: raw as Record<string, string>,
    };
  }
  let created;
  try {
    created = await prisma.category.create({ data: parsed.data });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return {
        ok: false,
        message: "このスラッグは既に使われています。別の値を入力してください。",
        fieldErrors: { slug: ["既存のスラッグと重複しています。"] },
        values: raw as Record<string, string>,
      };
    }
    throw error;
  }
  await logAudit({
    action: "CREATE",
    entityType: "CATEGORY",
    entityId: created.id,
    message: "カテゴリを追加しました。",
    meta: { name: created.name, slug: created.slug, order: created.order },
  });
  revalidatePath("/staff");
  revalidatePath("/staff/categories");
  revalidatePath("/staff/videos");
  revalidatePath("/patient");
  return { ok: true };
}

async function updateCategory(categoryId: string, formData: FormData) {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const parsed = categoryUpdateSchema.safeParse(raw);
  if (!parsed.success || Object.keys(parsed.data).length === 0) {
    return;
  }
  const updated = await prisma.category.update({
    where: { id: categoryId },
    data: parsed.data,
  });
  await logAudit({
    action: "UPDATE",
    entityType: "CATEGORY",
    entityId: updated.id,
    message: "カテゴリを更新しました。",
    meta: parsed.data,
  });
  revalidatePath("/staff");
  revalidatePath("/staff/categories");
  revalidatePath("/staff/videos");
  revalidatePath("/patient");
}

async function deleteCategory(categoryId: string) {
  "use server";
  const current = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!current) return;
  await prisma.category.delete({ where: { id: categoryId } });
  await logAudit({
    action: "DELETE",
    entityType: "CATEGORY",
    entityId: categoryId,
    message: "カテゴリを削除しました。",
    meta: { name: current.name, slug: current.slug },
  });
  revalidatePath("/staff");
  revalidatePath("/staff/categories");
  revalidatePath("/staff/videos");
  revalidatePath("/patient");
}

async function updateCategoryOrder(orderedIds: string[]) {
  "use server";
  if (orderedIds.length === 0) return;

  await prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.category.update({
        where: { id },
        data: { order: index },
      }),
    ),
  );

  await logAudit({
    action: "UPDATE",
    entityType: "CATEGORY",
    entityId: "order",
    message: "カテゴリの並び順を更新しました。",
    meta: { orderedIds },
  });

  revalidatePath("/staff");
  revalidatePath("/staff/categories");
  revalidatePath("/staff/videos");
  revalidatePath("/patient");
}

export default async function StaffCategoriesPage() {
  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      videoCategories: {
        include: { video: true },
        orderBy: { order: "asc" },
      },
    },
  });

  const orderItems = categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    order: category.order,
    videoCount: category.videoCategories.length,
  }));

  return (
    <div className="grid gap-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">カテゴリ管理</h1>
        <p className="text-sm text-slate-300">
          動画を整理するためのカテゴリを管理します。並び替えはドラッグで変更できます。
        </p>
      </header>

      <section className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
        <h2 className="text-sm font-semibold text-slate-200">カテゴリの追加</h2>
        <CreateCategoryForm action={createCategory} />
      </section>

      <section className="grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
        <h2 className="text-sm font-semibold text-slate-200">並び替え</h2>
        <p className="text-xs text-slate-400">
          カテゴリをドラッグして順番を変更し、「並び順を保存」を押してください。
        </p>
        <CategoryOrderList categories={orderItems} onSave={updateCategoryOrder} />
      </section>

      <ol className="grid gap-4">
        {categories.map((category) => (
          <li
            key={category.id}
            className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-5 py-4"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                  Order {category.order.toString().padStart(2, "0")}
                </p>
                <h2 className="text-lg font-semibold text-white">{category.name}</h2>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300">
                <span className="rounded-full border border-slate-700/70 px-3 py-1">
                  ID: {category.slug}
                </span>
                <span className="rounded-full border border-slate-700/70 px-3 py-1">
                  動画 {category.videoCategories.length} 本
                </span>
              </div>
            </div>

            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/40 p-4">
              <form
                className="grid gap-3 sm:grid-cols-[1fr_1fr_120px_auto]"
                action={updateCategory.bind(null, category.id)}
              >
                <label className="grid gap-1 text-xs text-slate-300">
                  名称
                  <input
                    className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                    name="name"
                    defaultValue={category.name}
                  />
                </label>
                <label className="grid gap-1 text-xs text-slate-300">
                  スラッグ
                  <input
                    className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                    name="slug"
                    defaultValue={category.slug}
                  />
                </label>
                <label className="grid gap-1 text-xs text-slate-300">
                  並び順
                  <input
                    className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
                    name="order"
                    type="number"
                    min="0"
                    defaultValue={category.order}
                  />
                </label>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="rounded-full border border-slate-600 px-4 py-2 text-xs text-slate-200 transition hover:border-sky-400 hover:text-white"
                  >
                    更新
                  </button>
                </div>
              </form>
              <form action={deleteCategory.bind(null, category.id)} className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-full border border-rose-400/40 px-4 py-2 text-xs text-rose-200 transition hover:border-rose-300 hover:text-rose-100"
                >
                  削除
                </button>
              </form>
            </div>

            <ul className="mt-4 grid gap-2 text-sm text-slate-200">
              {category.videoCategories.length === 0 ? (
                <li className="rounded-xl border border-dashed border-slate-700/80 px-3 py-2 text-slate-400">
                  まだ動画がありません。カテゴリに紐づく動画を追加してください。
                </li>
              ) : (
                category.videoCategories.map((item) => (
                  <li
                    key={item.videoId}
                    className="rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2"
                  >
                    <p className="font-semibold text-white">{item.video.title}</p>
                    <p className="text-xs text-slate-400">{item.video.description}</p>
                  </li>
                ))
              )}
            </ul>
          </li>
        ))}
      </ol>
    </div>
  );
}
