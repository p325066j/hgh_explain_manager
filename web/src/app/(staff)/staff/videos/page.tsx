import Link from "next/link";
import { getCategories, getVideos } from "@/lib/mock-data";
import type { VideoVisibility } from "@/lib/mock-data";

const visibilityLabel: Record<VideoVisibility, string> = {
    published: "公開中",
    in_review: "レビュー待ち",
    draft: "ドラフト",
};

const badgeClass: Record<VideoVisibility, string> = {
    published: "border-emerald-400/40 bg-emerald-500/10 text-emerald-100",
    in_review: "border-amber-400/40 bg-amber-500/10 text-amber-100",
    draft: "border-slate-600 bg-slate-800 text-slate-200",
};

export default function StaffVideosPage() {
    const videos = getVideos();
    const categories = getCategories();

    return (
        <div className="grid gap-8">
            <header className="flex flex-col gap-4 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-xl font-semibold text-white">動画ライブラリ</h1>
                    <p className="text-sm text-slate-300">カテゴリ別に整理された動画の一覧です。</p>
                </div>
                <Link
                    href="/staff/videos/new"
                    className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-4 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-400 hover:text-sky-100"
                >
                    新規登録
                </Link>
            </header>

            <div className="overflow-hidden rounded-3xl border border-slate-800/80">
                <table className="w-full table-auto text-left text-sm text-slate-200">
                    <thead className="bg-slate-900/80 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                            <th className="px-5 py-3">タイトル</th>
                            <th className="px-5 py-3">カテゴリ</th>
                            <th className="px-5 py-3">尺</th>
                            <th className="px-5 py-3">状態</th>
                            <th className="px-5 py-3">更新日時</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                        {videos.map((video) => {
                            const category = categories.find((item) => item.id === video.categoryId);
                            const visibility = video.visibility;
                            return (
                                <tr key={video.id} className="hover:bg-slate-900/60">
                                    <td className="px-5 py-4">
                                        <p className="font-semibold text-white">{video.title}</p>
                                        <p className="text-xs text-slate-400">{video.description}</p>
                                    </td>
                                    <td className="px-5 py-4">{category?.name ?? "-"}</td>
                                    <td className="px-5 py-4">{video.duration} 分</td>
                                    <td className="px-5 py-4">
                                        <span className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs uppercase tracking-wide ${badgeClass[visibility]}`}>
                                            {visibilityLabel[visibility]}
                                        </span>
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
