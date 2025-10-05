# MVP Architecture Outline

## Scope Alignment
- **MVP focus**: F001 動画管理システム, F002 カテゴリ分類機能, F003 タブレット最適化再生。
- **非範囲**: F004 以降 (オフライン、A11y拡張、多言語、分析等) はバックログとして保持。
- **ユーザーフロー**:
  1. 医療スタッフが動画とメタ情報(タイトル/説明/カテゴリ/対象治療)をアップロード。
  2. 看護師がカテゴリ毎の並び替え・タグ付けを行い、患者用端末に同期。
  3. 患者が待機時間中にカテゴリフィルタを使って動画を視聴、シンプルな再生操作に絞る。

## Next.js レイヤー構成
- **App Router**: `app/` 直下に role セグメントを定義。
  - `/(staff)` レイアウト: 認証前提の管理 UI (dashboard, video upload, category manager)。
  - `/patient` レイアウト: タブレット想定のフルスクリーン動画ブラウズ/再生。
  - 共有 UI コンポーネントは `src/components/` でサーバーコンポーネントをデフォルトにし、操作が必要な箇所のみクライアント化。
- **Metadata + Routing**:
  - 患者向けトップ `/patient` ではカテゴリグリッドと検索バー。
  - 動画詳細 `/patient/videos/[videoId]` はタブレット操作用 UI (大きなボタン、進捗バー含む)。
  - スタッフ向け `/staff/videos` 一覧, `/staff/videos/new`, `/staff/categories` 等を server actions + form で構築。

## データ/ドメイン設計
- **メインエンティティ**
  - `Video`: id, title, description, categoryId, procedures (array), duration, fileUrl, thumbnailUrl, visibility, createdAt, updatedAt.
  - `Category`: id, name, slug, order, createdAt, updatedAt.
  - `ViewLog` (backlog): patientId?, videoId, deviceId, viewedAt, completedRatio.
- **バリデーション**
  - API 入出力は Zod schema を `src/lib/validators/` に集約。
  - サーバー側でフォーム投稿を Zod parse → domain DTO 変換。
- **ストレージ方針**
  - Phase1: Prisma + SQLite (ローカル) でメタ情報を保持。動画ファイルは `public/uploads` へ保存し、後続でクラウド移行を検討。
  - ファイルアップロードは Next API Route (`app/api/videos/route.ts`) に multipart (formidable / next built-in) で受け取り、ファイルパスを DB に保存。
  - カテゴリ順序は `order` 数値で管理。ドラッグ&ドロップ UI は backlog。

## サービス/ヘルパー
- `src/lib/db` : Prisma client, repository helper。
- `src/lib/storage` : ファイル保存/削除の抽象化 (現在はローカル、将来 S3 等に差し替え予定)。
- `src/lib/video` : 動画サムネイル生成や長さ計算など (MVP ではプレースホルダ、後続対応)。

## テスト戦略
- **ユニット (Vitest)**: Zod schema・サーバー util の検証。
- **コンポーネントテスト**: Playwright component も検討。MVPでは Vitest + @testing-library/react。
- **E2E (Playwright)**: 患者フロー (カテゴリ→視聴)、スタッフフロー (アップロード→一覧反映) の happy path を最低 2 ケース。

## 初期タスク分解
1. **基盤整備**
   - Prisma + SQLite 初期化 (`pnpm dlx prisma init`)、環境変数 `.env.local` 雛形更新。
   - ESLint/Vitest/Playwright 設定を repo 要件に合わせて再確認。
2. **ドメインモデル & バリデーション**
   - `Video` / `Category` の Prisma schema 作成 → マイグレーション。
   - Zod schema (create/update payload, list filters)。
3. **API 実装**
   - `POST /api/videos` : アップロード + メタ登録。
   - `GET /api/videos` : フィルタ/カテゴリでの取得。
   - `PUT /api/videos/[id]`, `DELETE` (MVP では deactivate のみにするか検討)。
   - `GET /api/categories`, `POST /api/categories`。
4. **スタッフ UI**
   - `/staff` dashboard: 主要 KPI/操作導線。
   - `/staff/videos/new`: multi-step form (metadata → ファイル)。
   - `/staff/categories`: 並び替え UI, order 更新。
5. **患者 UI**
   - `/patient`: カテゴリグリッド + 検索。
   - `/patient/videos/[id]`: フルスクリーンプレイヤー (動画詳細 + 操作用ボタン)。
6. **PWA 対応**
   - Manifest, service worker (Next PWA plugin or custom) → F003 達成に必要。
   - オフラインは backlog、ただしプレイヤー UI はネットワークエラー時のハンドリングを入れる。
7. **テスト/チェックス**
   - Vitest ベースセット (schemas, helpers)。
   - Playwright baseline scripts。
   - Lint/typecheck/test scriptsを `package.json` に整備し CI 前提の npm scripts 確認。

## オープンポイント
- 認証/アクセス制御要件が未確定 → 患者端末は kiosk モード想定？別途確認が必要。
- 動画容量・長さ制限 (アップロード上限) → 医療機関の基盤に合わせて決定要。
- サムネイル生成/トランスコードの扱い → 将来フェーズでクラウドサービス検討。
- Node 20 系指定だが現状 Node 22.12.0 → バージョン切り替え方法 (nvm-windows 等) を要相談。
