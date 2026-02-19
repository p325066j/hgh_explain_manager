import { prisma } from "@/lib/db";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function StaffHomePage() {
  try {
    const [totals, latestUpdates, categories, reviewQueue, drafts] = await Promise.all([
      prisma.video.groupBy({ by: ["visibility"], _count: { _all: true } }),
      prisma.video.findMany({ orderBy: { updatedAt: "desc" }, take: 4 }),
      prisma.category.findMany({ orderBy: { order: "asc" } }),
      prisma.video.findMany({ where: { visibility: "IN_REVIEW" }, orderBy: { updatedAt: "desc" } }),
      prisma.video.findMany({ where: { visibility: "DRAFT" }, orderBy: { updatedAt: "desc" } }),
    ]);

    const countBy: Record<string, number> = Object.fromEntries(
      totals.map((t) => [t.visibility, t._count._all]),
    );

    const summary = {
      totals: {
        total: (countBy.DRAFT ?? 0) + (countBy.IN_REVIEW ?? 0) + (countBy.PUBLISHED ?? 0),
        published: countBy.PUBLISHED ?? 0,
        inReview: countBy.IN_REVIEW ?? 0,
        draft: countBy.DRAFT ?? 0,
        categories: categories.length,
      },
      latestUpdates,
    } as const;

    return (
      <div className="grid gap-10">
      <section className="grid gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6 sm:grid-cols-2 lg:grid-cols-4">
        <article className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4">
          <h2 className="text-sm text-sky-200">公開中の動画</h2>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.totals.published}</p>
        </article>
        <article className="rounded-2xl border border-amber-400/20 bg-amber-400/10 p-4">
          <h2 className="text-sm text-amber-100">レビュー待ち</h2>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.totals.inReview}</p>
        </article>
        <article className="rounded-2xl border border-slate-700/80 bg-slate-800/70 p-4">
          <h2 className="text-sm text-slate-200">ドラフト</h2>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.totals.draft}</p>
        </article>
        <article className="rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4">
          <h2 className="text-sm text-emerald-100">カテゴリ</h2>
          <p className="mt-2 text-2xl font-semibold text-white">{summary.totals.categories}</p>
        </article>
      </section>

      <section className="grid gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">最近更新された動画</h2>
            <p className="text-sm text-slate-300">レビュー完了やメタデータ更新が新しい順に並べています。</p>
          </div>
        </header>
        <div className="overflow-hidden rounded-2xl border border-slate-800/80">
          <table className="w-full table-auto text-left text-sm text-slate-200">
            <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
              <tr>
                <th className="px-4 py-3">タイトル</th>
                <th className="px-4 py-3">カテゴリ</th>
                <th className="px-4 py-3">更新日時</th>
                <th className="px-4 py-3">状態</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {summary.latestUpdates.map((video) => {
                const category = categories.find((item) => item.id === video.categoryId);
                return (
                  <tr key={video.id} className="hover:bg-slate-900/60">
                    <td className="px-4 py-3 font-medium text-white">{video.title}</td>
                    <td className="px-4 py-3">{category?.name ?? "-"}</td>
                    <td className="px-4 py-3">{dateFormatter.format(new Date(video.updatedAt))}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-xs uppercase tracking-wide">
                        {video.visibility === "PUBLISHED" && <span className="h-2 w-2 rounded-full bg-emerald-400" />}
                        {video.visibility === "DRAFT" && <span className="h-2 w-2 rounded-full bg-slate-400" />}
                        {video.visibility === "IN_REVIEW" && <span className="h-2 w-2 rounded-full bg-amber-300" />}
                        {video.visibility === "PUBLISHED"
                          ? "公開中"
                          : video.visibility === "IN_REVIEW"
                            ? "レビュー待ち"
                            : "ドラフト"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <article className="space-y-4 rounded-3xl border border-amber-400/20 bg-amber-500/10 p-6">
          <header>
            <h2 className="text-lg font-semibold text-white">レビュー待ちの動画</h2>
            <p className="text-sm text-amber-100">医師または看護師の確認が必要な動画です。内容・字幕・注釈を確認してください。</p>
          </header>
          <ul className="space-y-3">
            {reviewQueue.length === 0 && (
              <li className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">現在レビュー待ちはありません。</li>
            )}
            {reviewQueue.map((video) => (
              <li key={video.id} className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3">
                <p className="font-semibold text-white">{video.title}</p>
                <p className="text-sm text-amber-100">最終更新: {dateFormatter.format(new Date(video.updatedAt))}</p>
                <p className="mt-1 text-sm text-amber-50">{video.description}</p>
              </li>
            ))}
          </ul>
        </article>

        <article className="space-y-4 rounded-3xl border border-slate-800/70 bg-slate-900/70 p-6">
          <header>
            <h2 className="text-lg font-semibold text-white">ドラフト動画</h2>
            <p className="text-sm text-slate-300">文字起こしやチャプター情報が未設定のものを優先的に仕上げましょう。</p>
          </header>
          <ul className="space-y-3">
            {drafts.length === 0 && (
              <li className="rounded-2xl border border-slate-700/80 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">現在保存済みのドラフトはありません。</li>
            )}
            {drafts.map((video) => (
              <li key={video.id} className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3">
                <p className="font-semibold text-white">{video.title}</p>
                <p className="text-sm text-slate-300">最終更新: {dateFormatter.format(new Date(video.updatedAt))}</p>
                <p className="mt-1 text-sm text-slate-300">{video.description}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>
    </div>
    );
  } catch (error) {
    console.error("[StaffHomePage] DB初期化エラー", error);
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6">
        <h2 className="text-lg font-semibold text-white">初期セットアップが未完了です</h2>
        <p className="mt-2 text-sm text-amber-100">
          データベースが未初期化またはアクセスできないため、スタッフダッシュボードを表示できません。
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-amber-50">
          <li>Node 20 系に切り替え（例: nvm use 20）</li>
          <li>web 配下で <code>pnpm i</code> を実行</li>
          <li>初期化: <code>pnpm setup:db</code></li>
          <li>開発サーバ再起動: <code>pnpm dev</code></li>
        </ol>
        <p className="mt-4 text-xs text-amber-200">
          参考: <code>.env.local</code> に <code>DATABASE_URL</code> が設定されているか確認してください。
        </p>
      </div>
    );
  }
}
