import Link from "next/link";

const entryPoints = [
  {
    label: "スタッフ向けコンソール",
    description:
      "動画ライブラリの登録・公開、カテゴリ管理、稼働状況の確認を行います。",
    href: "/staff",
  },
  {
    label: "患者向け再生画面",
    description:
      "待合室タブレットなどから利用する動画視聴体験。カテゴリ選択と動画再生に特化しています。",
    href: "/patient",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="space-y-4">
          <p className="text-sm font-medium text-sky-300">HGH Explain Manager</p>
          <h1 className="text-pretty text-3xl font-semibold leading-tight sm:text-4xl">
            役割に応じた画面へ移動してください。
          </h1>
          <p className="max-w-3xl text-pretty text-base leading-7 text-slate-200">
            このポータルは院内スタッフと患者向け端末で共有利用されるアプリケーションです。
            スタッフは動画やカテゴリの管理、患者向け端末は視聴と操作に集中できるよう画面を分離しています。
          </p>
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          {entryPoints.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 shadow-lg shadow-black/30 transition hover:-translate-y-1 hover:border-sky-400/60"
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-sm uppercase tracking-[0.28em] text-sky-300">
                    {item.href === "/staff" ? "For Staff" : "For Patient"}
                  </p>
                  <h2 className="text-2xl font-semibold text-white">{item.label}</h2>
                  <p className="text-sm leading-7 text-slate-200">{item.description}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-sm font-semibold text-sky-300 transition group-hover:text-sky-200">
                  画面へ進む
                  <span aria-hidden className="text-base">→</span>
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="space-y-3 rounded-3xl border border-slate-800/80 bg-slate-900/70 p-8 text-sm text-slate-200">
          <h2 className="text-lg font-semibold text-white">運用時のメモ</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>動画の公開前に医師の確認を受け、レビュー済みタグを必ず設定してください。</li>
            <li>患者用端末は `/patient` をホームとしてブラウザのフルスクリーンを推奨します。</li>
            <li>ログインやアクセス制御は今後の実装対象です。端末の設置場所で物理的な管理を行ってください。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
