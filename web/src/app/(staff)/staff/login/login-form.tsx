"use client";

import { useActionState } from "react";

type FormState = {
  ok: boolean;
  message?: string;
};

type Props = {
  action: (formData: FormData) => Promise<FormState | void>;
};

export default function LoginForm({ action }: Props) {
  const [state, formAction] = useActionState<FormState, FormData>(async (_, formData) => {
    const result = await action(formData);
    return result ?? { ok: true };
  }, { ok: true });

  return (
    <form action={formAction} className="mt-6 grid gap-4">
      {state.message && (
        <p className="text-sm text-rose-200">{state.message}</p>
      )}
      <label className="grid gap-2 text-sm text-slate-200">
        パスコード
        <input
          name="passcode"
          type="password"
          className="rounded-xl border border-slate-700/80 bg-slate-950 px-3 py-2 text-base text-white focus:border-sky-400 focus:outline-none"
          placeholder="パスコードを入力"
          required
        />
      </label>
      <button
        type="submit"
        className="rounded-full border border-sky-500/40 bg-sky-500/20 px-5 py-2 text-sm font-semibold text-sky-100 transition hover:border-sky-400 hover:text-white"
      >
        ログイン
      </button>
    </form>
  );
}
