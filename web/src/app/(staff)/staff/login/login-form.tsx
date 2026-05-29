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
        パスワード
        <input
          name="password"
          type="password"
          className="ui-input"
          placeholder="パスワードを入力"
          required
        />
      </label>
      <button
        type="submit"
        className="ui-primary-btn"
      >
        ログイン
      </button>
    </form>
  );
}
