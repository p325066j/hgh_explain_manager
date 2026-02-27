import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

type Props = {
  params: Promise<{
    videoId: string;
  }>;
};

export default async function PatientVideoDetailPage({ params }: Props) {
  const { videoId } = await params;
  const video = await prisma.video.findFirst({
    where: { id: videoId, isVisible: true, isArchived: false },
    include: {
      videoCategories: { include: { category: true }, orderBy: { order: "asc" } },
    },
  });

  if (!video) {
    notFound();
  }

  const procedures = video.procedures
    ? video.procedures
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

  const getYouTubeEmbedUrl = (url: string) => {
    try {
      const parsed = new URL(url);
      if (parsed.hostname === "youtu.be") {
        const id = parsed.pathname.slice(1);
        return id ? `https://www.youtube.com/embed/${id}` : null;
      }
      if (parsed.hostname.endsWith("youtube.com")) {
        if (parsed.pathname === "/watch") {
          const id = parsed.searchParams.get("v");
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
        if (parsed.pathname.startsWith("/embed/")) {
          const id = parsed.pathname.split("/")[2];
          return id ? `https://www.youtube.com/embed/${id}` : null;
        }
      }
      return null;
    } catch {
      return null;
    }
  };

  const embedUrl = getYouTubeEmbedUrl(video.fileUrl);
  const categoryNames = video.videoCategories.map((item) => item.category.name).join(", ");
  const complications = video.complications?.trim() ?? "";
  const precautions = video.precautions?.trim() ?? "";

  const renderText = (value: string, emptyText: string) => {
    if (!value) {
      return <p className="text-sm text-slate-400">{emptyText}</p>;
    }
    return <p className="whitespace-pre-line text-sm text-slate-200">{value}</p>;
  };

  return (
    <div className="grid gap-6">
      <Link
        href="/patient"
        className="inline-flex items-center gap-2 text-sm text-sky-200 underline underline-offset-4"
      >
        カテゴリ一覧に戻る
      </Link>

      <section className="grid gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
        <header className="space-y-2">
          <p className="text-xs uppercase tracking-[0.3em] text-sky-300">
            {categoryNames || "カテゴリ未設定"}
          </p>
          <h1 className="text-2xl font-semibold text-white">{video.title}</h1>
          <p className="text-sm text-slate-300">{video.description}</p>
        </header>

        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-black">
          {embedUrl ? (
            <iframe
              title={video.title}
              src={embedUrl}
              className="h-full w-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              key={video.fileUrl}
              controls
              className="h-full w-full"
              poster={video.thumbnailUrl || undefined}
            >
              <source src={video.fileUrl} type="video/mp4" />
              この動画はブラウザで再生できません。
            </video>
          )}
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-200">対象となる検査・治療</p>
          {procedures.length === 0 ? (
            <p className="text-sm text-slate-400">登録されていません。</p>
          ) : (
            <ul className="list-disc space-y-1 pl-6 text-sm text-slate-300">
              {procedures.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-200">合併症</p>
          {renderText(complications, "登録されていません。")}
        </div>

        <div className="grid gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4">
          <p className="text-sm text-slate-200">注意事項</p>
          {renderText(precautions, "登録されていません。")}
        </div>

        <footer className="flex flex-col gap-1 text-xs text-slate-400">
          <span>
            最終更新日{" "}
            {new Date(video.updatedAt).toLocaleString("ja-JP", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
          <span>公開状態: {video.isVisible ? "公開" : "非公開"}</span>
        </footer>
      </section>
    </div>
  );
}

