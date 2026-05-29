import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
};

export default function PatientLayout({ children }: Props) {
  return (
    <div className="min-h-screen bg-[#dfdfdf] text-[#191919]">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6">
        <header className="flex flex-col gap-2 text-center">
          <p className="text-xl font-bold uppercase tracking-[0.4em] text-[#249191]">For Patient</p>
          <h1 className="text-4xl font-semibold text-[#191919]">説明動画のご案内</h1>
          <p className="text-sm text-slate-800">
            
          </p>
         
        </header>
        <main className="pb-16">{children}</main>
      </div>
    </div>
  );
}
