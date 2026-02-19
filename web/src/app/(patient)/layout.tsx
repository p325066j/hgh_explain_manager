import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PatientLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-3 text-center">
          <p className="text-xs uppercase tracking-[0.4em] text-sky-300">Patient View</p>
          <h1 className="text-3xl font-semibold text-white">検査・治療のご案内</h1>
          <p className="text-sm text-slate-300">
            画面の指示に従ってカテゴリを選択し、視聴したい動画を選んでください。
          </p>
          <div className="flex justify-center gap-3 text-xs text-slate-400">
            <Link href="/" className="underline underline-offset-4">
              スタッフ画面に戻る
            </Link>
          </div>
        </header>
        <main className="pb-16">{children}</main>
      </div>
    </div>
  );
}
