import Link from "next/link";
import { prisma } from "@/lib/db";

type Props = {
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function PatientTopPage({ searchParams }: Props) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const q = resolvedSearchParams?.q?.trim();
  const hasQuery = Boolean(q);
  const keywordFilter = q
    ? {
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      }
    : undefined;

  const categories = await prisma.category.findMany({
    orderBy: { order: "asc" },
    include: {
      videoCategories: {
        where: {
          video: {
            isVisible: true,
            isArchived: false,
            ...(keywordFilter ?? {}),
          },
        },
        include: { video: true },
        orderBy: { order: "asc" },
      },
    },
  });

  return (
    <div className="grid gap-6">
      <section className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
        <h1 className="text-2xl font-semibold text-white">説明動画を検索</h1>
        <p className="mt-2 text-sm text-slate-300">
          カテゴリを選ぶ前に、キーワードで動画を絞り込めます。
        </p>
        <form className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            name="q"
            defaultValue={q}
            placeholder="キーワードを入力（タイトル・説明）"
            className="w-full rounded-xl border border-slate-700/80 bg-slate-950 px-4 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="rounded-full border border-sky-500/40 bg-sky-500/20 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white"
            >
              検索
            </button>
            {hasQuery && (
              <Link
                href="/patient"
                className="rounded-full border border-slate-700/80 px-5 py-2 text-sm text-slate-200 transition hover:border-slate-500 hover:text-white"
              >
                クリア
              </Link>
            )}
          </div>
        </form>
        {hasQuery && (
          <p className="mt-3 text-xs text-slate-400">
            「{q}」で検索中です。カテゴリごとに該当動画を表示しています。
          </p>
        )}
      </section>

      {categories
        .map((category) => {
          const videos = category.videoCategories.map((item) => item.video);
          return { category, videos };
        })
        .filter(({ videos }) => !(hasQuery && videos.length === 0))
        .map(({ category, videos }) => {
        return (
          <section
            key={category.id}
            className="rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6"
          >
            <header className="mb-4">
              <h2 className="text-2xl font-semibold text-white">{category.name}</h2>
              <p className="text-sm text-slate-300">
                視聴したい説明動画を選択してください。
              </p>
            </header>
            <div className="grid gap-4 sm:grid-cols-2">
              {videos.map((video) => (
                <Link
                  href={`/patient/videos/${video.id}`}
                  key={video.id}
                  className="flex h-full flex-col justify-between gap-3 rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-left text-slate-200 transition hover:-translate-y-1 hover:border-sky-400/60"
                >
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.25em] text-sky-300">
                      {Math.round(video.duration ?? 0)} 分
                    </p>
                    <h3 className="text-lg font-semibold text-white">{video.title}</h3>
                    <p className="text-sm text-slate-300">{video.description}</p>
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-200">
                    視聴する
                    <span aria-hidden className="text-lg">
                      →
                    </span>
                  </span>
                </Link>
              ))}
              {videos.length === 0 && (
                <p className="rounded-2xl border border-dashed border-slate-700/80 bg-slate-950/60 p-4 text-sm text-slate-400">
                  {hasQuery
                    ? "検索条件に合う動画がありません。"
                    : "このカテゴリにはまだ動画が登録されていません。"}
                </p>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
