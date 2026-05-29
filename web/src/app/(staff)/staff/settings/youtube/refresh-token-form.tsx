"use client";

type RefreshTokenFormProps = {
  action: (formData: FormData) => Promise<{ ok: boolean; message: string }>;
  disabled?: boolean;
};

export default function RefreshTokenForm({ action, disabled }: RefreshTokenFormProps) {
  return (
    <form
      action={async (formData) => {
        const result = await action(formData);
        window.alert(result.message);
      }}
      className="mt-4 grid gap-4"
    >
      <label className="grid gap-2 text-sm text-slate-300">
        <span>新しいリフレッシュトークン</span>
        <input
          type="password"
          name="refreshToken"
          required
          disabled={disabled}
          autoComplete="off"
          className="rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 text-slate-100 disabled:opacity-50"
          placeholder="OAuth Playground で取得した 1//... の値"
        />
      </label>
      <button type="submit" disabled={disabled} className="ui-primary-btn w-fit disabled:opacity-50">
        暗号化して保存
      </button>
    </form>
  );
}
