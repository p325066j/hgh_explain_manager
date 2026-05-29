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
      "検査・治療等の説明動画を視聴と合併症や注意事項を確認できます。",
    href: "/patient",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#dfdfdf] text-[#191919]">
      <main className="mx-auto flex w-full max-w-5xl flex-col gap-12 px-6 py-16">
        <header className="space-y-2">
        
        </header>

        <section className="grid gap-6 sm:grid-cols-2">
          {entryPoints.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group ui-card p-8 transition hover:-translate-y-1 hover:border-[#249191]/60"
            >
              <div className="flex h-full flex-col justify-between gap-6">
                <div className="space-y-3">
                  <p className="text-2xl uppercase font-bold tracking-[0.28em] text-[#249191]">
                    {item.href === "/staff" ? "For Staff" : "For Patient"}
                  </p>
                  <h2 className="text-3xl font-semibold text-white">{item.label}</h2>
                  <p className="text-sm leading-7 text-slate-300">{item.description}</p>
                </div>
                <span className="inline-flex items-center gap-2 text-m font-semibold text-[#249191] transition group-hover:text-[#2ea8a8]">
                  画面へ進む
                  <span aria-hidden className="text-base">→</span>
                </span>
              </div>
            </Link>
          ))}
        </section>

        <section className="ui-card space-y-3 p-8 text-sm text-slate-300">
          <h2 className="text-lg font-semibold text-white">運用時のメモ</h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>動画の公開前に医師の確認を受け、レビュー済みタグを必ず設定してください。</li>
            <li>患者は自身の端末からQRコードでアクセスできます。</li>
            <li>ログインやアクセス制御は今後の実装対象です。端末の設置場所で物理的な管理を行ってください。</li>
          </ul>
        </section>
      </main>
    </div>
  );
}
