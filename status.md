# HGH Explain Manager - プロジェクト進捗（2026-02-19）

最終更新: 2026-02-19

## プロジェクト概要
- **プロジェクト名**: 医療機関向け検査・治療説明動画管理 SaaS
- **技術スタック**: Next.js (App Router / RSC), TypeScript, Tailwind CSS, Prisma, SQLite
- **開発体制**: 1名（Cursor + Codex IDE）
- **推奨環境**: Node 20.x, pnpm 9.x（.nvmrc あり）
- **環境変数**: `.env.local` に `DATABASE_URL` / `STAFF_PASSCODE` / `YOUTUBE_*` などを設定

---

## ロードマップ比較（MVP）
### フェーズ 0: 基盤整備
- **状態**: 完了
- **根拠**: `pnpm lint` / `pnpm typecheck` / `pnpm test:unit` / `pnpm test:e2e` すべて通過

### フェーズ 1: ドメイン / API
- **状態**: 完了
- **根拠**:
  - Prisma: `Video` / `Category` / `VideoCategory` / `AuditLog` を実装（`web/prisma/schema.prisma`）
  - API: `GET/POST /api/videos`、`GET/POST/PATCH/DELETE /api/categories`、`GET /api/audit-logs`

### フェーズ 2: スタッフ向け UI
- **状態**: 主要機能完了
- **根拠**:
  - `/staff` ダッシュボード
  - `/staff/videos` 一覧・公開/非公開切替・アップロード/URL登録導線
  - `/staff/videos/new` URL 登録（重複時のエラー表示含む）
  - `/staff/videos/upload` 動画アップロード
  - `/staff/categories` 管理 + 並び替え + 入力バリデーション表示
  - `/staff/settings/youtube` 一括反映
  - `/staff/audit-logs` 監査ログ一覧

### フェーズ 3: 患者向け UI
- **状態**: 完了
- **根拠**:
  - `/patient` 一覧 + キーワード検索
  - `/patient/videos/[videoId]` 再生

### フェーズ 4: PWA & QA
- **状態**: 完了（オフライン不要・プッシュ不要の前提で最小構成）
- **根拠**:
  - `manifest` 追加（`web/src/app/manifest.ts`）
  - アイコン差し替え完了（`web/public/icons/icon-192.png`, `web/public/icons/icon-512.png`）
  - maskable アイコン追加（`web/public/icons/icon-192-maskable.png`, `web/public/icons/icon-512-maskable.png`）
  - `metadata` に manifest/icons、`viewport` に `themeColor` を設定（`web/src/app/layout.tsx`）
  - QA: `pnpm lint` / `pnpm typecheck` / `pnpm test:unit` / `pnpm test:e2e` 通過

---

## 実装済み（機能）
- **簡易パスコード認証**
  - `/staff/login` + cookie 認証、`/staff` 配下はミドルウェアで保護
- **YouTube 手動 URL 登録 + バリデーション**
  - URL 形式/ID 抽出/説明必須（`web/src/lib/validators.ts`）
- **YouTube 自動アップロード**
  - `/staff/videos/upload` でアップロード
  - YouTube Data API（`web/src/lib/youtube.ts`）
- **公開/非公開の一括反映**
  - `/staff/settings/youtube` で実行、反映状態を更新
- **患者向け検索（キーワード）**
  - `/patient` の `q` パラメータでフィルタ
- **監査ログ**
  - 記録: 動画/カテゴリ/一括反映（UI/API）
  - 一覧 UI / API: `/staff/audit-logs` / `/api/audit-logs`
- **PWA 基本対応**
  - インストール可能（オフライン・プッシュ通知は不要）

---

## 未完了 / 改善余地
- **YouTube 運用手順のドキュメント化**: 未整備（トークン更新/再連携手順）
- **アプリアイコンの高解像度化**: 108x108 から拡大のため、1024px 版が用意でき次第差し替え推奨

---

## 直近のテスト結果
- `pnpm lint`: OK
- `pnpm typecheck`: OK
- `pnpm test:unit`: OK
- `pnpm test:e2e`: OK

---

## 次にやること（優先度順）
1. YouTube 運用手順のドキュメント化
2. PWA アイコンの高解像度版差し替え（1024px 以上）