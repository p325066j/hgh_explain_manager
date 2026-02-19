import Link from "next/link";
import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

const getStatus = (isVisible: boolean, isArchived: boolean) => {
  if (isArchived) return "アーカイブ" as const;
  return isVisible ? ("表示中" as const) : ("非表示" as const);
};

const badgeClass: Record<ReturnType<typeof getStatus>, string> = {
  表示中: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
  非表示: "border-slate-600 bg-slate-800 text-slate-200",
  アーカイブ: "border-amber-400/40 bg-amber-500/10 text-amber-100",
};

const syncLabel: Record<string, string> = {
  PENDING: "未反映",
  SUCCESS: "反映済み",
  FAILED: "失敗",
  SKIPPED: "スキップ",
};

export default async function StaffVideosPage() {
  const videos = await prisma.video.findMany({
    include: {
      videoCategories: { include: { category: true }, orderBy: { order: "asc" } },
    },
    orderBy: { updatedAt: "desc" },
  });

  async function toggleVisibility(formData: FormData) {
    "use server";
    const id = String(formData.get("videoId") ?? "");
    if (!id) return;
    const current = await prisma.video.findUnique({ where: { id } });
    if (!current || current.isArchived) return;

    const nextVisible = !current.isVisible;
    await prisma.video.update({
      where: { id },
      data: {
        isVisible: nextVisible,
        isVisibilityDirty: true,
        visibilitySyncStatus: "PENDING",
        visibilitySyncError: null,
        visibilitySyncedAt: null,
      },
    });

    await logAudit({
      action: "UPDATE",
      entityType: "VIDEO",
      entityId: id,
      message: "公開状態を更新しました。",
      meta: { from: current.isVisible, to: nextVisible },
    });

    revalidatePath("/staff/videos");
    revalidatePath("/staff/settings/youtube");
    revalidatePath("/patient");
  }

  return (
    <div className="grid gap-8">
      <header className="flex flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-white">動画ライブラリ</h1>
          <p className="text-sm text-slate-300">カテゴリ別に整理された動画一覧です。</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/staff/videos/upload"
            className="inline-flex items-center gap-2 rounded-full border border-emerald-500/40 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-100 transition hover:border-emerald-400 hover:text-emerald-50"
          >
            アップロード
          </Link>
          <Link
            href="/staff/videos/new"
            className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-400 hover:text-sky-100"
          >
            URL登録
          </Link>
        </div>
      </header>

      <div className="overflow-hidden rounded-3xl border border-slate-800/80">
        <table className="w-full table-auto text-left text-sm text-slate-200">
          <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
            <tr>
              <th className="px-5 py-3">タイトル</th>
              <th className="px-5 py-3">カテゴリ</th>
              <th className="px-5 py-3">時間</th>
              <th className="px-5 py-3">状態</th>
              <th className="px-5 py-3">反映</th>
              <th className="px-5 py-3">更新日時</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {videos.map((video) => {
              const status = getStatus(video.isVisible, video.isArchived);
              const durationLabel = video.duration ? `${video.duration} 分` : "-";
              const categoryNames = video.videoCategories
                .map((item) => item.category.name)
                .join(", ");
              return (
                <tr key={video.id} className="hover:bg-slate-900/60">
                  <td className="px-5 py-4">
                    <p className="font-semibold text-white">{video.title}</p>
                    <p className="text-xs text-slate-400">{video.description}</p>
                  </td>
                  <td className="px-5 py-4">{categoryNames || "-"}</td>
                  <td className="px-5 py-4">{durationLabel}</td>
                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${badgeClass[status]}`}
                    >
                      {status}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="text-xs text-slate-200">
                      {syncLabel[video.visibilitySyncStatus] ?? video.visibilitySyncStatus}
                    </div>
                    {video.visibilitySyncError && (
                      <div className="mt-1 text-xs text-rose-200">
                        {video.visibilitySyncError}
                      </div>
                    )}
                    {!video.isArchived && (
                      <form action={toggleVisibility} className="mt-2">
                        <input type="hidden" name="videoId" value={video.id} />
                        <button
                          type="submit"
                          className="rounded-full border border-slate-700/80 px-3 py-1 text-xs text-slate-200 transition hover:border-sky-400 hover:text-white"
                        >
                          {video.isVisible ? "非表示にする" : "表示にする"}
                        </button>
                      </form>
                    )}
                  </td>
                  <td className="px-5 py-4 text-slate-300">
                    {new Date(video.updatedAt).toLocaleString("ja-JP", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}