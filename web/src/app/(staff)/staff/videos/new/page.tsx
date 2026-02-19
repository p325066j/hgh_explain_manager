import { prisma } from "@/lib/db";
import { videoCreateSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

async function createVideo(formData: FormData) {
  "use server";
  const raw = Object.fromEntries(formData.entries());
  const parsed = videoCreateSchema.safeParse(raw);
  if (!parsed.success) {
    return;
  }
  const data = parsed.data;
  await prisma.video.create({
    data: {
      title: data.title,
      description: data.description,
      categoryId: data.categoryId,
      procedures: (data.procedures ?? []).join(", "),
      duration: data.duration,
      visibility: data.visibility,
      fileUrl: "/videos/placeholder.mp4",
    },
  });
  revalidatePath("/staff");
  revalidatePath("/staff/videos");
  redirect("/staff/videos");
}

export default async function StaffVideoNewPage() {
  const categories = await prisma.category.findMany({ orderBy: { order: "asc" } });

  return (
    <div className="grid gap-8 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-6">
      <header className="space-y-2">
        <h1 className="text-xl font-semibold text-white">動画の登録</h1>
        <p className="text-sm text-slate-300">
          メタデータを入力後、動画ファイルをアップロードしてください。アップロード処理は後続タスクで実装します。
        </p>
      </header>

      <form className="grid gap-6" action={createVideo}>
        <fieldset className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
          <legend className="px-2 text-sm font-semibold text-slate-200">基本情報</legend>
          <label className="grid gap-2 text-sm text-slate-200">
            タイトル
            <input
              className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
              name="title"
              placeholder="例: 検査前の準備"
              required
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            概要説明
            <textarea
              className="min-h-[120px] rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
              name="description"
              placeholder="患者さんに伝えたいポイントを簡潔に記載してください"
            />
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            カテゴリ
            <select
              className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
              name="categoryId"
              defaultValue=""
              required
            >
              <option value="" disabled>
                カテゴリを選択
              </option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            対象となる診療・処置
            <input
              className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
              name="procedures"
              placeholder="例: 胃内視鏡, 鎮静管理"
            />
            <span className="text-xs text-slate-400">カンマ区切りで入力します。</span>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            想定再生時間（分）
            <input
              type="number"
              min="1"
              className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
              name="duration"
              placeholder="8"
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
          <legend className="px-2 text-sm font-semibold text-slate-200">コンテンツファイル</legend>
          <label className="grid gap-2 text-sm text-slate-200">
            動画ファイル
            <input
              type="file"
              name="file"
              accept="video/mp4,video/webm"
              className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950 px-3 py-4 text-base text-white"
              disabled
            />
            <span className="text-xs text-slate-400">
              アップロード機能は今後の実装予定です。現在はメタデータの整備のみ行ってください。
            </span>
          </label>
          <label className="grid gap-2 text-sm text-slate-200">
            サムネイル画像
            <input
              type="file"
              name="thumbnail"
              accept="image/png,image/jpeg"
              className="rounded-xl border border-dashed border-slate-700/80 bg-slate-950 px-3 py-4 text-base text-white"
              disabled
            />
          </label>
        </fieldset>

        <fieldset className="grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
          <legend className="px-2 text-sm font-semibold text-slate-200">公開設定</legend>
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="radio" name="visibility" value="draft" defaultChecked />
            ドラフトとして保存
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="radio" name="visibility" value="in_review" />
            レビュー依頼（確認者に通知）
          </label>
          <label className="flex items-center gap-3 text-sm text-slate-200">
            <input type="radio" name="visibility" value="published" disabled />
            公開（レビュー完了後に設定可能）
          </label>
        </fieldset>

        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="reset"
            className="rounded-full border border-slate-700/80 px-5 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
          >
            クリア
          </button>
          <button
            type="submit"
            className="rounded-full border border-sky-500/40 bg-sky-500/20 px-6 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white"
          >
            下書きとして保存
          </button>
        </div>
      </form>
    </div>
  );
}
