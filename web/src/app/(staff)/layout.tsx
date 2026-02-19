import Link from "next/link";
import type { ReactNode } from "react";

const navigation = [
  { label: "ダッシュボード", href: "/staff" },
  { label: "動画一覧", href: "/staff/videos" },
  { label: "動画登録", href: "/staff/videos/new" },
  { label: "カテゴリ管理", href: "/staff/categories" },
];

type Props = {
  children: ReactNode;
};

export default function StaffLayout({ children }: Props) {
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
        </header>

        <main className="grid gap-8 pb-16">{children}</main>
      </div>
    </div>
  );
}
