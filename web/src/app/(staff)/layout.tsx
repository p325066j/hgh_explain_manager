import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

const navigation = [
  { label: "ダッシュボード", href: "/staff" },
  { label: "動画一覧", href: "/staff/videos" },
  { label: "動画登録", href: "/staff/videos/new" },
  { label: "動画アップロード", href: "/staff/videos/upload" },
  { label: "カテゴリ管理", href: "/staff/categories" },
  { label: "監査ログ", href: "/staff/audit-logs" },
  { label: "YouTube設定", href: "/staff/settings/youtube" },
];

type Props = {
  children: ReactNode;
};

export default function StaffLayout({ children }: Props) {
  async function logout() {
    "use server";
    const store = await cookies();
    store.delete("staff_auth");
    redirect("/staff/login");
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-6 py-10">
        <header className="flex flex-col gap-4 border-b border-slate-800 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300">Staff Console</p>
            <h1 className="text-2xl font-semibold text-white">動画運用ダッシュボード</h1>
            <p className="mt-1 text-sm text-slate-300">
              動画ライブラリの更新、レビュー、カテゴリ編成をここから行います。
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="スタッフナビゲーション" className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full border border-slate-700/80 px-4 py-2 text-sm text-slate-200 transition hover:border-sky-400/60 hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action={logout}>
              <button
                type="submit"
                className="rounded-full border border-rose-400/50 px-4 py-2 text-sm text-rose-100 transition hover:border-rose-300 hover:text-white"
              >
                ログアウト
              </button>
            </form>
          </div>
        </header>

        <main className="grid gap-8 pb-16">{children}</main>
      </div>
    </div>
  );
}