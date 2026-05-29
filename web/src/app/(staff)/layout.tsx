import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { STAFF_AUTH_COOKIE } from "@/lib/staff-auth";

const navigation = [
  { label: "ダッシュボード", href: "/staff" },
  { label: "動画一覧", href: "/staff/videos" },
  { label: "動画登録", href: "/staff/videos/new" },
  { label: "動画アップロード", href: "/staff/videos/upload" },
  { label: "カテゴリ管理", href: "/staff/categories" },
  { label: "ログ", href: "/staff/audit-logs" },
  { label: "YouTube設定", href: "/staff/settings/youtube" },
];

type Props = {
  children: ReactNode;
};

export default function StaffLayout({ children }: Props) {
  async function logout() {
    "use server";
    const store = await cookies();
    store.delete(STAFF_AUTH_COOKIE);
    redirect("/staff/login");
  }

  return (
    <div className="min-h-screen bg-[#dfdfdf] text-[#191919]">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-8 sm:px-6 sm:py-10">
        <header className="flex flex-col gap-4 border-b border-slate-400/40 pb-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase font-bold tracking-[0.35em] text-[#249191]">Staff Console</p>
            <h1 className="text-2xl font-semibold text-[#191919]">動画運用ダッシュボード</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <nav aria-label="スタッフナビゲーション" className="flex flex-wrap gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-[#191919]/30 px-4 py-2 text-sm text-[#191919] transition hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-[#249191]"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <form action={logout}>
              <button
                type="submit"
                className="ui-danger-btn px-4"
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
