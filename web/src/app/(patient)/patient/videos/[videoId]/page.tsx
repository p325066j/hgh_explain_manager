import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategories, getVideoById } from "@/lib/mock-data";

type Props = {
    params: {
        videoId: string;
    };
};

export default function PatientVideoDetailPage({ params }: Props) {
    const video = getVideoById(params.videoId);

    if (!video) {
        notFound();
    }

    const categories = getCategories();
    const category = categories.find((item) => item.id === video.categoryId);

    return (
        <div className="grid gap-6">
            <Link
                href="/patient"
                className="inline-flex items-center gap-2 text-sm text-sky-200 underline underline-offset-4"
            >
                ← カテゴリ一覧に戻る
            </Link>

            <section className="grid gap-4 rounded-3xl border border-slate-800/70 bg-slate-900/60 p-6">
                <header className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-sky-300">{category?.name ?? "カテゴリ未設定"}</p>
                    <h1 className="text-2xl font-semibold text-white">{video.title}</h1>
                    <p className="text-sm text-slate-300">{video.description}</p>
                </header>

                <div className="aspect-video w-full overflow-hidden rounded-2xl border border-slate-800/80 bg-black">
                    <video
                        key={video.fileUrl}
                        controls
                        className="h-full w-full"
                        poster={video.thumbnailUrl || undefined}
                    >
                        <source src={video.fileUrl} type="video/mp4" />
                        お使いの端末では動画を再生できません。
                    </video>
                </div>

                <div className="grid gap-2 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-4">
                    <p className="text-sm text-slate-200">想定される検査・処置</p>
                    <ul className="list-disc space-y-1 pl-6 text-sm text-slate-300">
                        {video.procedures.map((item) => (
                            <li key={item}>{item}</li>
                        ))}
                    </ul>
                </div>

                <footer className="flex flex-col gap-1 text-xs text-slate-400">
                    <span>
                        更新日: {new Date(video.updatedAt).toLocaleString("ja-JP", { dateStyle: "medium", timeStyle: "short" })}
                    </span>
                    <span>
                        公開状態: {video.visibility === "published" ? "公開中" : video.visibility === "in_review" ? "レビュー待ち" : "ドラフト"}
                    </span>
                </footer>
            </section>
        </div>
    );
}
