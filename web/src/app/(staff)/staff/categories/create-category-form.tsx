"use client";

import { useActionState } from "react";

type FormState = {
  ok: boolean;
  message?: string;
  fieldErrors?: Record<string, string[]>;
  values?: Record<string, string>;
};

type Props = {
  action: (formData: FormData) => Promise<FormState | void>;
};

const getError = (errors: Record<string, string[]> | undefined, key: string) =>
  errors?.[key]?.[0];

export default function CreateCategoryForm({ action }: Props) {
  const [state, formAction, isPending] = useActionState<FormState, FormData>(
    async (_, formData) => {
      const result = await action(formData);
      return result ?? { ok: true };
    },
    { ok: true },
  );

  return (
    <form
      className="grid gap-4 sm:grid-cols-[1.2fr_1.2fr_0.6fr_auto]"
      action={formAction}
    >
      {state.message && (
        <p className="sm:col-span-4 rounded-xl border border-rose-400/40 bg-rose-500/10 px-4 py-2 text-sm text-rose-200">
          {state.message}
        </p>
      )}
      <label className="grid gap-1 text-xs text-slate-300">
        名称
        <input
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          name="name"
          placeholder="例: 入院説明"
          defaultValue={state.values?.name ?? ""}
          required
        />
        {getError(state.fieldErrors, "name") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "name")}</span>
        )}
      </label>
      <label className="grid gap-1 text-xs text-slate-300">
        スラッグ
        <input
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          name="slug"
          placeholder="例: hospitalization"
          defaultValue={state.values?.slug ?? ""}
          required
        />
        <span className="text-[11px] text-slate-400">
          英数字とハイフンのみ。例: hospitalization, upper-gi-endoscopy
        </span>
        {getError(state.fieldErrors, "slug") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "slug")}</span>
        )}
      </label>
      <label className="grid gap-1 text-xs text-slate-300">
        並び順
        <input
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-sm text-white focus:border-sky-400 focus:outline-none"
          name="order"
          type="number"
          min="0"
          defaultValue={state.values?.order ?? "0"}
          required
        />
        {getError(state.fieldErrors, "order") && (
          <span className="text-xs text-rose-200">{getError(state.fieldErrors, "order")}</span>
        )}
      </label>
      <div className="flex items-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-full border border-sky-500/40 bg-sky-500/10 px-5 py-2 text-sm font-semibold text-sky-200 transition hover:border-sky-400 hover:text-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isPending ? "追加中..." : "追加"}
        </button>
      </div>
    </form>
  );
}