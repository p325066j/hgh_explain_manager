import Link from "next/link";
import { getCategories, getVideosByCategory } from "@/lib/mock-data";

export default function PatientTopPage() {
  const categories = getCategories();

  return (
    <div className="grid gap-6">
      {categories.map((category) => {
        const videos = getVideosByCategory(category.id);
        return (
          <section key={category.id} className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
            <header className="mb-4">
              <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
              <p className="text-sm text-slate-300">該当する検査や治療の説明動画を選んでください。</p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <Link
                  href={`/patient/videos/${video.id}`}
                  key={video.id}
                  className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-left text-slate-200 transition hover:-translate-y-1 hover:border-sky-400/60"
                >
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-300">{Math.round(video.duration)} 分</p>
                    <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                    <p className="text-sm text-slate-300">{video.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
                    視聴する
                    <span aria-hidden className="text-lg">▶</span>
                  </span>
                </Link>
              ))}
              {videos.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-400">
                  このカテゴリにはまだ動画が登録されていません。
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
