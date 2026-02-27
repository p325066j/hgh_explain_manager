"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

type CategoryOption = {
  id: string;
  name: string;
};

type Props = {
  categories: CategoryOption[];
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
};

const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      className="rounded-full border border-sky-500/40 bg-sky-500/20 px-6 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={pending}
    >
      {pending ? "送信中..." : "登録して保存"}
    </button>
  );
};

const FieldError = ({ errors }: { errors?: string[] }) => {
  if (!errors || errors.length === 0) return null;
  return <p className="text-xs text-rose-200">{errors[0]}</p>;
};

const getValue = (value: unknown) => (typeof value === "string" ? value : "");

export default function VideoForm({ categories, action }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(action, { ok: true });

  return (
    <form className="grid gap-6" action={formAction}>
      {!state.ok && state.message && (
        <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
          {state.message}
        </div>
      )}

      <fieldset className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
        <legend className="px-2 text-sm font-semibold text-slate-200">基本情報</legend>
        <label className="grid gap-2 text-sm text-slate-200">
          タイトル
          <input
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="title"
            placeholder="例: 胃内視鏡検査の準備"
            defaultValue={getValue(state.values?.title)}
            required
          />
          <FieldError errors={state.fieldErrors?.title} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          説明
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="description"
            placeholder="動画の目的、検査前後の流れ、注意点などを入力してください"
            defaultValue={getValue(state.values?.description)}
            required
          />
          <FieldError errors={state.fieldErrors?.description} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          合併症
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="complications"
            placeholder="例: 出血、穿孔、鎮静薬による副作用など"
            defaultValue={getValue(state.values?.complications)}
          />
          <FieldError errors={state.fieldErrors?.complications} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          注意事項
          <textarea
            className="min-h-[120px] rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="precautions"
            placeholder="例: 食事制限、来院時間、検査後の安静など"
            defaultValue={getValue(state.values?.precautions)}
          />
          <FieldError errors={state.fieldErrors?.precautions} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          カテゴリ
          <select
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="categoryId"
            defaultValue={getValue(state.values?.categoryId)}
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
          <FieldError errors={state.fieldErrors?.categoryId} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          対象となる検査・治療（カンマ区切り）
          <input
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="procedures"
            placeholder="例: 上部消化管内視鏡検査, 鎮静管理"
            defaultValue={getValue(state.values?.procedures)}
          />
          <span className="text-xs text-slate-400">カンマ区切りで複数指定できます。</span>
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          動画の長さ（分）
          <input
            type="number"
            min="1"
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="duration"
            placeholder="8"
            defaultValue={getValue(state.values?.duration)}
          />
          <FieldError errors={state.fieldErrors?.duration} />
        </label>
      </fieldset>

      <fieldset className="grid gap-4 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
        <legend className="px-2 text-sm font-semibold text-slate-200">動画URL</legend>
        <label className="grid gap-2 text-sm text-slate-200">
          YouTube URL
          <input
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="fileUrl"
            placeholder="https://www.youtube.com/watch?v=xxxxxxxxxxx"
            defaultValue={getValue(state.values?.fileUrl)}
            required
          />
          <span className="text-xs text-slate-400">
            公開済みの YouTube URL を入力してください。
          </span>
          <FieldError errors={state.fieldErrors?.fileUrl} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          サムネイルURL（任意）
          <input
            className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
            name="thumbnailUrl"
            placeholder="https://i.ytimg.com/vi/xxxxxxxxxxx/hqdefault.jpg"
            defaultValue={getValue(state.values?.thumbnailUrl)}
          />
          <FieldError errors={state.fieldErrors?.thumbnailUrl} />
        </label>
      </fieldset>

      <fieldset className="grid gap-3 rounded-2xl border border-slate-800/80 bg-slate-900/80 p-5">
        <legend className="px-2 text-sm font-semibold text-slate-200">公開設定</legend>
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="radio"
            name="isVisible"
            value="false"
            defaultChecked={getValue(state.values?.isVisible) !== "true"}
          />
          非公開（スタッフのみ）
        </label>
        <label className="flex items-center gap-3 text-sm text-slate-200">
          <input
            type="radio"
            name="isVisible"
            value="true"
            defaultChecked={getValue(state.values?.isVisible) === "true"}
          />
          公開（患者向けに表示）
        </label>
      </fieldset>

      <div className="flex flex-wrap justify-end gap-3">
        <button
          type="reset"
          className="rounded-full border border-slate-700/80 px-5 py-2 text-sm text-slate-300 transition hover:border-slate-500 hover:text-slate-100"
        >
          クリア
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
