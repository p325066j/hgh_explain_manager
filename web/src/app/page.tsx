const features = [
  {
    title: "動画ライブラリを一元管理",
    description:
      "検査・治療説明動画をカテゴリや対象診療科で整理。検索と絞り込みで必要なコンテンツへ数クリックで到達できます。",
  },
  {
    title: "スタッフの業務負担を削減",
    description:
      "説明内容・配布資料・補足メモをテンプレート化。院内で統一された説明をいつでも再生でき、口頭説明の時間を短縮します。",
  },
  {
    title: "患者体験を最適化",
    description:
      "タブレットに最適化したプレーヤーで待ち時間を有効活用。聞き直し・字幕表示に対応し、不安の軽減につなげます。",
  },
];

const workflow = [
  {
    step: "01",
    title: "動画アップロード",
    detail: "フォーマットとサムネイルをチェックしながら、担当スタッフがドラフトを登録。",
  },
  {
    step: "02",
    title: "院内レビュー",
    detail: "確認者がコメントと公開範囲を設定。バージョン履歴で差分を追跡できます。",
  },
  {
    step: "03",
    title: "患者端末へ配信",
    detail: "カテゴリごとのプレイリストが自動同期。待合室タブレットで即座に再生可能。",
  },
];

const highlights = [
  {
    label: "平均説明時間を",
    value: "-37%",
    body: "動画化により事前説明を標準化。スタッフ1名あたりの説明時間を大幅削減。",
  },
  {
    label: "患者理解度アンケート",
    value: "+24pt",
    body: "字幕・章立て・補足資料リンクで、聞き逃しを最小化し理解度が向上。",
  },
  {
    label: "導入まで最短",
    value: "2週間",
    body: "既存動画のインポート支援とチェックリストでスムーズに立ち上げ可能。",
  },
];

export default function Home() {
  return (
    <div className="relative isolate min-h-screen overflow-hidden bg-slate-950 text-slate-50">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_55%)]" />

      <header className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 pb-16 pt-20 sm:pt-24 lg:pb-24">
        <div className="flex items-center gap-3 text-sm text-sky-300">
          <span className="inline-flex items-center gap-2 rounded-full border border-sky-500/40 bg-sky-500/10 px-3 py-1 font-medium tracking-wide">
            HGH Explain Manager
          </span>
          <span className="hidden border-l border-sky-500/40 pl-3 sm:inline">
            医療機関向け動画説明プラットフォーム
          </span>
        </div>
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="space-y-6">
            <h1 className="text-pretty text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">
              説明業務を動画で標準化し、スタッフと患者の時間に余白を生む。
            </h1>
            <p className="text-pretty text-base/7 text-slate-200 sm:text-lg/8">
              HGH Explain Manager は検査・治療の説明動画を一元管理し、スタッフの説明業務を自動化する院内向け SaaS です。
              カテゴリ管理・公開ワークフロー・患者用プレーヤーを備え、導入初日から統一された案内が可能になります。
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <a
                className="inline-flex items-center justify-center rounded-full bg-sky-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-sky-500/30 transition hover:bg-sky-300"
                href="#contact"
              >
                デモを申し込む
              </a>
              <a
                className="inline-flex items-center justify-center rounded-full border border-slate-100/30 px-6 py-3 text-base font-semibold text-slate-100 transition hover:border-slate-100 hover:text-white"
                href="#features"
              >
                機能を見る
              </a>
            </div>
          </div>
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-700/60 bg-slate-900/60 p-6 text-sm text-slate-200 shadow-xl shadow-black/40 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex-1 space-y-1">
              <p className="text-xs uppercase tracking-[0.35em] text-slate-400">
                今週の配信状況
              </p>
              <p className="text-2xl font-semibold text-white">カテゴリ 12 / 動画 86</p>
              <p className="text-xs text-slate-300">
                直近 30 日で新規動画 14 本。レビュー遅延ゼロを継続中。
              </p>
            </div>
            <div className="flex items-center gap-2 self-end rounded-full border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              稼働中
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24" id="features">
        <section className="grid gap-8 lg:grid-cols-3">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="group relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-8 shadow-xl shadow-black/30 transition hover:-translate-y-1 hover:border-sky-500/40"
            >
              <div className="absolute -top-20 right-0 h-40 w-40 rounded-full bg-sky-500/10 blur-2xl transition group-hover:bg-sky-400/20" />
              <h2 className="text-xl font-semibold text-white">{feature.title}</h2>
              <p className="mt-4 text-sm/7 text-slate-200">{feature.description}</p>
            </article>
          ))}
        </section>

        <section className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_1.25fr] lg:items-center">
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold text-white">導入から運用までの３ステップ</h2>
            <p className="text-sm/7 text-slate-200">
              チェックリストとロール割り当てで、院内合意形成から公開までをスムーズに進行。動画レビュー、カテゴリ同期、患者端末への配信をひとつのワークフローで管理します。
            </p>
          </div>
          <div className="grid gap-4">
            {workflow.map((item) => (
              <div
                key={item.title}
                className="flex gap-6 rounded-2xl border border-slate-800/70 bg-slate-900/50 p-6 shadow-lg shadow-black/30"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full border border-sky-400/40 bg-sky-500/10 text-lg font-semibold text-sky-200">
                  {item.step}
                </span>
                <div className="space-y-1">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="text-sm/7 text-slate-200">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 rounded-3xl border border-emerald-500/20 bg-emerald-500/5 p-10 shadow-xl shadow-emerald-500/20" id="contact">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="space-y-3">
              <h2 className="text-2xl font-semibold text-white">まずはお気軽にお問い合わせください</h2>
              <p className="text-sm/7 text-emerald-100">
                無料オンボーディングと導入計画のすり合わせを専門チームがサポートします。ヒアリングから試験導入まで、最短 2 週間で開始可能です。
              </p>
            </div>
            <a
              className="inline-flex items-center justify-center rounded-full bg-emerald-400 px-6 py-3 text-base font-semibold text-slate-950 shadow-lg shadow-emerald-400/30 transition hover:bg-emerald-300"
              href="mailto:contact@hgh-explain.example"
            >
              メールで相談する
            </a>
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            {highlights.map((highlight) => (
              <div
                key={highlight.label}
                className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-5"
              >
                <p className="text-xs uppercase tracking-[0.3em] text-emerald-200">
                  {highlight.label}
                </p>
                <p className="mt-1 text-2xl font-semibold text-white">{highlight.value}</p>
                <p className="mt-3 text-sm/7 text-emerald-50">{highlight.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-slate-800/80 bg-slate-950/80 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 text-sm text-slate-400 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-medium text-slate-200">© {new Date().getFullYear()} HGH Explain Manager</p>
          <div className="flex flex-wrap gap-4">
            <a className="transition hover:text-slate-200" href="#">
              利用規約
            </a>
            <a className="transition hover:text-slate-200" href="#">
              プライバシー
            </a>
            <a className="transition hover:text-slate-200" href="#features">
              機能概要
            </a>
            <a className="transition hover:text-slate-200" href="#contact">
              お問い合わせ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
