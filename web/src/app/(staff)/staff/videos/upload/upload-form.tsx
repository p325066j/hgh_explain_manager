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
          className="ui-input-white text-sm file:mr-4 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-2 file:text-xs file:font-semibold file:text-slate-100"
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
          className="ui-input-white text-sm"
          placeholder="例: 上部消化管内視鏡検査の準備"
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
          className="ui-input-white min-h-[120px] text-sm"
          placeholder="動画の目的や注意事項などを入力してください"
          required
        />
        {getError(state.fieldErrors, "description") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "description")}</span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        合併症
        <textarea
          name="complications"
          rows={4}
          defaultValue={state.values?.complications ?? ""}
          className="ui-input-white min-h-[120px] text-sm"
          placeholder="例: 出血、穿孔、鎮静薬による副作用など"
        />
        {getError(state.fieldErrors, "complications") && (
          <span className="text-xs text-rose-200">
            {getError(state.fieldErrors, "complications")}
          </span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        注意事項
        <textarea
          name="precautions"
          rows={4}
          defaultValue={state.values?.precautions ?? ""}
          className="ui-input-white min-h-[120px] text-sm"
          placeholder="例: 食事制限、来院時間、検査後の安静など"
        />
        {getError(state.fieldErrors, "precautions") && (
          <span className="text-xs text-rose-200">
            {getError(state.fieldErrors, "precautions")}
          </span>
        )}
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        カテゴリ（アプリ側）
        <select
          name="categoryId"
          defaultValue={state.values?.categoryId ?? ""}
          className="ui-input-white text-sm"
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
          className="ui-input-white text-sm"
          placeholder="例: 27（Education）"
        />
        <span className="text-xs text-slate-400">
          省略時は {DEFAULT_CATEGORY_ID} を使用します。
        </span>
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        対象となる検査・治療（カンマ区切り）
        <input
          name="procedures"
          defaultValue={state.values?.procedures ?? ""}
          className="ui-input-white text-sm"
          placeholder="例: 内視鏡検査, CT検査"
        />
      </label>

      <label className="grid gap-2 text-sm text-slate-200">
        動画の長さ（分）
        <input
          name="duration"
          type="number"
          min={1}
          max={600}
          defaultValue={state.values?.duration ?? ""}
          className="ui-input-white text-sm"
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
        className="ui-primary-btn rounded-full text-white px-6 py-2 text-sm font-semibold transition disabled:opacity-60"
      >
        {isPending ? "アップロード中..." : "YouTubeにアップロード"}
      </button>
    </form>
  );
}
