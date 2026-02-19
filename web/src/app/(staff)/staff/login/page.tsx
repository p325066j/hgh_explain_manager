import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import LoginForm from "./login-form";

async function login(formData: FormData) {
  "use server";
  const passcode = String(formData.get("passcode") ?? "");
  const expected = process.env.STAFF_PASSCODE ?? "";
  if (!expected || passcode !== expected) {
    return { ok: false, message: "パスコードが正しくありません。" };
  }

  const store = await cookies();
  store.set("staff_auth", "1", {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  redirect("/staff");
}

export default function StaffLoginPage() {
  return (
    <div className="mx-auto w-full max-w-lg rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 text-slate-100">
      <h1 className="text-2xl font-semibold text-white">スタッフログイン</h1>
      <p className="mt-2 text-sm text-slate-300">
        スタッフ用のパスコードを入力してください。
      </p>

      <LoginForm action={login} />
    </div>
  );
}
