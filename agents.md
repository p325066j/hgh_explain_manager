# プロジェクト概要
丁寧な日本語で回答してください。
Cursor＋Codex IDE上で、Next.js(TypeScript)を中心としたWebアプリを設計→実装→テスト→レビューまで一貫して行う。
私一人で開発・運用するため、自動化・ガードレール・チェックリストで安全性と速度を両立する。
「困ったらAIに聞く」を前提に、タスク分解・実装・テスト作成までエージェント主導で進める。

## セットアップ/ビルド/テスト

### 依存解決

- Node 20系 / pnpm 使用
- `pnpm i`（初回）／`pnpm dlx playwright install --with-deps`（E2E初回）
- 秘密情報は `.env` ではなく `.env.local` に。雛形は `.env.example` を更新

### Lint/Typecheck

- `pnpm lint`（eslint＋prettier）
- `pnpm typecheck`（tsc --noEmit）

### 単体テスト

- `pnpm test:unit`（Vitest：watch時は `pnpm test:unit --watch`）

### E2E

- `pnpm test:e2e`（Playwright、主要ブラウザで並列実行）
- 失敗時は自動でトレース/スクショを `./playwright-report/` に保存

**重要**: 変更をコミットする前に上のチェックが全て緑であること

## コーディング規約（要点）

### TypeScript
- strict。import順序はeslint-plugin-importに従う。PRごとに型エラーゼロ。

### PRタイトル
- Conventional Commits 準拠（例: `feat(auth): add line login button` / `fix(api): handle 401 on refresh`）
- 日本語本文OK。概要→背景→対応→検証手順の順で簡潔に

### その他
- React: Server Components優先（Next.js）、Client側は必要最小限
- CSS: 基本はTailwind、複雑箇所は@applyで共通化
- API層は薄く・型安全（zodで入出力バリデーション）
- ファイル命名はkebab-case.tsx、テストは同階層 `*.spec.ts(x)`
- コメントは「なぜ」を中心に（実装の「何」は型とコードで表現）

## ガードレール / 禁止事項

- 秘密情報を追加しない。生成コードにAPIキーを埋め込まない。
- 破壊的変更は`docs/adr/`にADR追加後に実施。
- mainブランチへ直接pushしない（`feat/*` / `fix/*` ブランチ運用、PRを経由）。
- テストの`it.skip`/`test.skip`で意図なくチェックを回避しない。必要時は理由をPR本文に必ず記載。
- CI設定の変更・依存追加（重量級ライブラリ）はPRで理由と代替案を提示。
- 自動生成ファイルの大量コミット禁止（`dist/`, `.next/`, `playwright-report/` はignore）。
- 型の`any`安易使用禁止（`// TODO(any): <理由>` を付記し、Issue化する）。

## 要件・受入基準の参照

- `docs/spec/`：機能要件・非機能要件（パフォーマンス/セキュリティ/運用）
- `docs/acceptance/`：ユーザーストーリーごとの受入基準（Given/When/Then）
- GitHub Issues：各タスクの詳細・設計メモ・スクリーンショット・回帰テスト観点

## PRルール

変更理由/影響範囲/テスト結果をPR本文に記載。

### 理由
課題・背景・なぜ今か

### 影響範囲
UI/UX、API、データ、依存、運用（監視/ログ）

### テスト結果
`pnpm lint` / `pnpm typecheck` / `pnpm test:unit` / `pnpm test:e2e` の実行ログ要約、スクショ・トレース添付

### 追加の手動確認手順
（「このURLへ」「このボタンを押すと〜」）を箇条書き

### 未解決のTODO/リスク
明記し、Issueへリンク