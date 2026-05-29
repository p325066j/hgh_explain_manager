import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  checkStaffLoginRateLimit,
  clearStaffLoginFailures,
  getClientIpFromHeaders,
  recordStaffLoginFailure,
} from "@/lib/staff-login-rate-limit";
import {
  getStaffPasswordConfigError,
  isStaffPasswordConfigured,
  verifyStaffPassword,
} from "@/lib/staff-password";
import {
  STAFF_AUTH_COOKIE,
  createStaffSessionCookieValue,
  staffSessionCookieOptions,
} from "@/lib/staff-auth";
import LoginForm from "./login-form";

async function login(formData: FormData) {
  "use server";

  if (!isStaffPasswordConfigured()) {
    return { ok: false, message: getStaffPasswordConfigError() };
  }

  const requestHeaders = await headers();
  const clientIp = getClientIpFromHeaders(requestHeaders);
  const rateLimit = await checkStaffLoginRateLimit(clientIp);
  if (!rateLimit.allowed) {
    return {
      ok: false,
      message: `ログイン試行回数が上限に達しました。${rateLimit.retryAfterSeconds ?? 0}秒後に再試行してください。`,
    };
  }

  const password = String(formData.get("password") ?? "");
  if (!verifyStaffPassword(password)) {
    await recordStaffLoginFailure(clientIp);
    return { ok: false, message: "パスワードが正しくありません。" };
  }

  const store = await cookies();
  const session = await createStaffSessionCookieValue().catch(() => null);
  if (!session) {
    return { ok: false, message: "スタッフセッション設定が不足しています。" };
  }

  await clearStaffLoginFailures(clientIp);
  store.set(STAFF_AUTH_COOKIE, session, staffSessionCookieOptions());
  redirect("/staff");
}

export default function StaffLoginPage() {
  return (
    <div className="ui-card mx-auto w-full max-w-lg p-8 text-slate-100">
      <h1 className="text-2xl font-semibold text-white">スタッフログイン</h1>
      <p className="mt-2 text-sm text-slate-300">
        スタッフ用のパスワードを入力してください。
      </p>

      <LoginForm action={login} />
    </div>
  );
}
