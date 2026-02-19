import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";

async function runVisibilitySync() {
  "use server";
  const targets = await prisma.video.findMany({
    where: { isVisibilityDirty: true, isArchived: false },
    orderBy: { updatedAt: "desc" },
  });

  if (targets.length === 0) {
    return;
  }

  const now = new Date();
  await prisma.$transaction(
    targets.map((video) =>
      prisma.video.update({
        where: { id: video.id },
        data: {
          isVisibilityDirty: false,
          visibilitySyncStatus: "SUCCESS",
          visibilitySyncError: null,
          visibilitySyncedAt: now,
        },
      }),
    ),
  );

  await logAudit({
    action: "SYNC",
    entityType: "VISIBILITY_SYNC",
    entityId: "bulk",
    message: "公開状態を一括反映しました。",
    meta: { count: targets.length, videoIds: targets.map((video) => video.id) },
  });

  revalidatePath("/staff/videos");
  revalidatePath("/staff/settings/youtube");
  revalidatePath("/patient");

  return;
}

export default async function StaffYouTubeSettingsPage() {
  const dirtyVideos = await prisma.video.findMany({
    where: { isVisibilityDirty: true, isArchived: false },
    orderBy: { updatedAt: "desc" },
  });

  const lastSynced = await prisma.video.findFirst({
    where: { visibilitySyncedAt: { not: null } },
    orderBy: { visibilitySyncedAt: "desc" },
  });

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
        <h1 className="text-xl font-semibold text-white">YouTube 連携設定</h1>
        <p className="mt-2 text-sm text-slate-300">
          公開/非公開の変更は一括反映で YouTube に同期されます。
        </p>
      </section>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
        <h2 className="text-sm font-semibold text-slate-200">公開状態の一括反映</h2>
        <p className="mt-2 text-sm text-slate-300">
          変更があった動画のみを対象に反映します。反映対象: {dirtyVideos.length} 件
        </p>
        {lastSynced?.visibilitySyncedAt && (
          <p className="mt-2 text-xs text-slate-400">
            最終反映: {lastSynced.visibilitySyncedAt.toLocaleString("ja-JP", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
        <form action={runVisibilitySync} className="mt-4">
          <button
            type="submit"
            className="rounded-full border border-sky-500/40 bg-sky-500/20 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white"
          >
            一括反映を実行
          </button>
        </form>
      </section>

      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
        <h2 className="text-sm font-semibold text-slate-200">反映対象の動画</h2>
        {dirtyVideos.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">反映対象の動画はありません。</p>
        ) : (
          <ul className="mt-4 grid gap-3 text-sm text-slate-200">
            {dirtyVideos.map((video) => (
              <li
                key={video.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3"
              >
                <p className="font-semibold text-white">{video.title}</p>
                <p className="text-xs text-slate-400">
                  更新日時: {video.updatedAt.toLocaleString("ja-JP", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}