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
      className="ui-primary-btn px-6"
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

      <fieldset className="ui-subcard-form grid gap-4 p-5">
        <legend className="border border-[#126666] rounded-xl bg-[#126666] px-2 text-m font-semibold text-white">基本情報</legend>
        <label className="grid gap-2 text-sm text-slate-200">
          タイトル
          <input
            className="ui-input-white"
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
            className="ui-input-white min-h-[120px]"
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
            className="ui-input-white min-h-[120px]"
            name="complications"
            placeholder="例: 出血、穿孔、鎮静薬による副作用など"
            defaultValue={getValue(state.values?.complications)}
          />
          <FieldError errors={state.fieldErrors?.complications} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          注意事項
          <textarea
            className="ui-input-white min-h-[120px]"
            name="precautions"
            placeholder="例: 食事制限、来院時間、検査後の安静など"
            defaultValue={getValue(state.values?.precautions)}
          />
          <FieldError errors={state.fieldErrors?.precautions} />
        </label>
        <label className="grid gap-2 text-sm text-slate-200">
          カテゴリ
          <select
            className="ui-input-white"
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
            className="ui-input-white"
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
            className="ui-input-white"
            name="duration"
            placeholder="8"
            defaultValue={getValue(state.values?.duration)}
          />
          <FieldError errors={state.fieldErrors?.duration} />
        </label>
      </fieldset>

      <fieldset className="ui-subcard-form grid gap-4 p-5">
        <legend className="border border-[#126666] rounded-xl bg-[#126666] px-2 text-m font-semibold text-white">動画URL</legend>
        <label className="grid gap-2 text-sm text-slate-200">
          YouTube URL
          <input
            className="ui-input-white"
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
            className="ui-input-white"
            name="thumbnailUrl"
            placeholder="https://i.ytimg.com/vi/xxxxxxxxxxx/hqdefault.jpg"
            defaultValue={getValue(state.values?.thumbnailUrl)}
          />
          <FieldError errors={state.fieldErrors?.thumbnailUrl} />
        </label>
      </fieldset>

      <fieldset className="ui-subcard-form grid gap-3 p-5">
        <legend className="border border-[#126666] rounded-xl bg-[#126666] px-2 text-m font-semibold text-white">公開設定</legend>
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
          className="ui-secondary-btn"
        >
          クリア
        </button>
        <SubmitButton />
      </div>
    </form>
  );
}
