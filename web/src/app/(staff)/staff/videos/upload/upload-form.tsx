"use client";

import { useActionState } from "react";

const DEFAULT_CATEGORY_ID = "27";

type Category = {
  id: string;
  name: string;
};

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

type Props = {
  categories: Category[];
  action: (formData: FormData) => Promise<FormState | void>;
};

const getError = (errors: Record<string, string[]> | undefined, key: string) =>
  errors?.[key]?.[0];

export default function UploadForm({ categories, action }: Props) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const result = await action(formData);
      return result ?? { ok: true };
    },
    { ok: true },
  );

  return (
    <form action={formAction} className="grid gap-5">
      {state.message && (
        <p className="rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {state.message}
        </p>
      )}

      <label className="grid gap-2 text-sm text-slate-200">
        動画ファイル
        <input
          name="file"
          type="file"
          accept="video/*"
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white file:mr-4 file:rounded-lg file:border-0 file:bg-slate-800 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-100"
          required
        />
        {getError(state.fieldErrors, "file") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "file")}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        タイトル
        <input
          name="title"
          defaultValue={state.values?.title ?? ""}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          placeholder="例: 上部消化管内視鏡検査の流れ"
          required
        />
        {getError(state.fieldErrors, "title") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "title")}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        説明
        <textarea
          name="description"
          rows={4}
          defaultValue={state.values?.description ?? ""}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          placeholder="例: 検査の目的と注意事項を説明しています。"
          required
        />
        {getError(state.fieldErrors, "description") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "description")}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        カテゴリ（アプリ内）
        <select
          name="categoryId"
          defaultValue={state.values?.categoryId ?? ""}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
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
        {getError(state.fieldErrors, "categoryId") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "categoryId")}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        YouTube カテゴリID
        <input
          name="youtubeCategoryId"
          defaultValue={state.values?.youtubeCategoryId ?? DEFAULT_CATEGORY_ID}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          placeholder="例: 27（Education）"
        />
        <span className="text-xs text-slate-400">
          指定がない場合は {DEFAULT_CATEGORY_ID} を使用します。
        </span>
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        関連する検査・治療（カンマ区切り）
        <input
          name="procedures"
          defaultValue={state.values?.procedures ?? ""}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          placeholder="例: 胃カメラ, 上部消化管内視鏡"
        />
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        目安の所要時間（分）
        <input
          name="duration"
          type="number"
          min={1}
          max={600}
          defaultValue={state.values?.duration ?? ""}
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
        />
      </label>

      <label className="flex items-center gap-2 text-sm text-slate-200">
        <input
          type="checkbox"
          name="isVisible"
          defaultChecked={state.values?.isVisible ? state.values.isVisible === "true" : true}
          className="h-4 w-4 rounded border-slate-500 bg-slate-900"
        />
        患者向けに公開する
      </label>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-full border border-sky-500/40 bg-sky-500/20 px-6 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isPending ? "アップロード中..." : "YouTube にアップロード"}
      </button>
    </form>
  );
}
