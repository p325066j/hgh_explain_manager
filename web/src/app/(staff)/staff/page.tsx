import { prisma } from "@/lib/db";

const dateFormatter = new Intl.DateTimeFormat("ja-JP", {
  dateStyle: "medium",
  timeStyle: "short",
});

const getCategoryLabel = (video: { videoCategories: { category: { name: string } }[] }) => {
  const names = video.videoCategories.map((item) => item.category.name).filter(Boolean);
  return names.length === 0 ? "-" : names.join(", ");
};

export default async function StaffHomePage() {
  try {
    const videos = await prisma.video.findMany({
      include: {
        videoCategories: { include: { category: true }, orderBy: { order: "asc" } },
      },
      orderBy: { updatedAt: "desc" },
    });

    const total = videos.length;
    const visible = videos.filter((video) => video.isVisible && !video.isArchived).length;
    const hidden = videos.filter((video) => !video.isVisible && !video.isArchived).length;
    const archived = videos.filter((video) => video.isArchived).length;

    const latestUpdates = videos.slice(0, 4);
    const hiddenVideos = videos.filter((video) => !video.isVisible && !video.isArchived);
    const archivedVideos = videos.filter((video) => video.isArchived);

    return (
      <div className="grid gap-10">
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-2xl border border-emerald-400 bg-emerald-600 p-4">
            <h2 className="text-m text-slate-100">表示中の動画</h2>
            <p className="mt-2 text-2xl font-semibold text-white">{visible}</p>
          </article>
          <article className="rounded-2xl border border-red-400 bg-red-500 p-4">
            <h2 className="text-m text-slate-100">非表示の動画</h2>
            <p className="mt-2 text-2xl font-semibold text-white">{hidden}</p>
          </article>
          <article className="rounded-2xl border border-amber-400 bg-amber-500 p-4">
            <h2 className="text-m text-slate-100">アーカイブ</h2>
            <p className="mt-2 text-2xl font-semibold text-white">{archived}</p>
          </article>
          <article className="rounded-2xl border border-sky-400 bg-sky-600 p-4">
            <h2 className="text-m text-slate-100">登録済み動画</h2>
            <p className="mt-2 text-2xl font-semibold text-white">{total}</p>
          </article>
        </section>

        <section className="ui-card grid gap-4">
          <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">最新の更新</h2>
            </div>
          </header>
          <div className="overflow-hidden rounded-2xl border border-slate-800/80">
            <table className="w-full table-auto text-left text-m text-slate-200">
              <thead className="bg-[#249191] text-sm uppercase tracking-wide text-slate-100">
                <tr>
                  <th className="px-4 py-3">タイトル</th>
                  <th className="px-4 py-3">カテゴリ</th>
                  <th className="px-4 py-3">更新日時</th>
                  <th className="px-4 py-3">状態</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {latestUpdates.map((video) => {
                  const status = video.isArchived
                    ? "アーカイブ"
                    : video.isVisible
                      ? "表示中"
                      : "非表示";
                  return (
                    <tr key={video.id} className="hover:bg-slate-900/60">
                      <td className="px-4 py-3 font-medium text-white">{video.title}</td>
                      <td className="px-4 py-3">{getCategoryLabel(video)}</td>
                      <td className="px-4 py-3">{dateFormatter.format(new Date(video.updatedAt))}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-2 rounded-full border border-slate-700/70 px-3 py-1 text-xs uppercase tracking-wide">
                          {status}
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
          <article className="space-y-4 rounded-3xl border border-red-400 bg-red-500 p-6">
            <header>
              <h2 className="text-lg font-semibold text-white">非表示の動画</h2>
              <p className="text-sm text-slate-300">
                公開前に内容を確認したい動画はこちらに残しておけます。
              </p>
            </header>
            <ul className="space-y-3">
              {hiddenVideos.length === 0 && (
                <li className="rounded-2xl border border-slate-700 bg-slate-400 px-4 py-3 text-sm text-slate-300">
                  現在、非表示の動画はありません。
                </li>
              )}
              {hiddenVideos.map((video) => (
                <li
                  key={video.id}
                  className="rounded-2xl border border-slate-700/70 bg-slate-900/70 px-4 py-3"
                >
                  <p className="font-semibold text-white">{video.title}</p>
                  <p className="text-sm text-slate-300">
                    最終更新: {dateFormatter.format(new Date(video.updatedAt))}
                  </p>
                  <p className="mt-1 text-sm text-slate-300">{video.description}</p>
                </li>
              ))}
            </ul>
          </article>

          <article className="space-y-4 rounded-3xl border border-amber-400 bg-amber-500 p-6">
            <header>
              <h2 className="text-lg font-semibold text-white">アーカイブ</h2>
              <p className="text-sm text-amber-100">
                画面に表示しない動画をアーカイブとして保存します。
              </p>
            </header>
            <ul className="space-y-3">
              {archivedVideos.length === 0 && (
                <li className="rounded-2xl border border-amber-300/20 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
                  現在アーカイブされた動画はありません。
                </li>
              )}
              {archivedVideos.map((video) => (
                <li
                  key={video.id}
                  className="rounded-2xl border border-amber-400/20 bg-amber-500/10 px-4 py-3"
                >
                  <p className="font-semibold text-white">{video.title}</p>
                  <p className="text-sm text-amber-100">
                    最終更新: {dateFormatter.format(new Date(video.updatedAt))}
                  </p>
                  <p className="mt-1 text-sm text-amber-50">{video.description}</p>
                </li>
              ))}
            </ul>
          </article>
        </section>
      </div>
    );
  } catch (error) {
    console.error("[StaffHomePage] DB接続エラー", error);
    return (
      <div className="mx-auto max-w-3xl rounded-3xl border border-amber-400/30 bg-amber-500/10 p-6">
        <h2 className="text-lg font-semibold text-white">データ取得に失敗しました</h2>
        <p className="mt-2 text-sm text-amber-100">
          データベースに接続できません。設定が正しいか、サーバーの状態を確認してください。
        </p>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-amber-50">
          <li>Node 20 に切り替え（例: volta pin node@20）</li>
          <li>web 配下で <code>pnpm i</code> を実行</li>
          <li><code>pnpm setup:db</code> を実行</li>
          <li><code>pnpm dev</code> で開発サーバー起動</li>
        </ol>
        <p className="mt-4 text-xs text-amber-200">
          例: <code>.env.local</code> に <code>DATABASE_URL</code> を設定してください。
        </p>
      </div>
    );
  }
}
