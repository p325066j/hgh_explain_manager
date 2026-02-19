import { getCategories, getVideosByCategory } from "@/lib/mock-data";

export default function StaffCategoriesPage() {
  const categories = getCategories();

  return (
    <div className="grid gap-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">カテゴリ管理</h1>
        <p className="text-sm text-slate-300">
          並び順は優先度が高い順です。ドラッグ＆ドロップによる並べ替えは後続タスクで実装します。
        </p>
      </header>

      <ol className="grid gap-4">
        {categories.map((category) => {
          const videos = getVideosByCategory(category.id);
          return (
            <li
              key={category.id}
              className="rounded-2xl border border-slate-800/80 bg-slate-900/80 px-5 py-4"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Order {category.order.toString().padStart(2, "0")}</p>
                  <h2 className="text-lg font-semibold text-white">{category.name}</h2>
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="rounded-full border border-slate-700/70 px-3 py-1">
                    ID: {category.slug}
                  </span>
                  <span className="rounded-full border border-slate-700/70 px-3 py-1">
                    動画 {videos.length} 本
                  </span>
                </div>
              </div>

              <ul className="mt-4 grid gap-2 text-sm text-slate-200">
                {videos.length === 0 ? (
                  <li className="rounded-xl border border-dashed border-slate-700/80 px-3 py-2 text-slate-400">
                    未登録の動画があります。カテゴリに紐づける動画を検討してください。
                  </li>
                ) : (
                  videos.map((video) => (
                    <li key={video.id} className="rounded-xl border border-slate-800/80 bg-slate-950/60 px-3 py-2">
                      <p className="font-semibold text-white">{video.title}</p>
                      <p className="text-xs text-slate-400">{video.description}</p>
                    </li>
                  ))
                )}
              </ul>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
