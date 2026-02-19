# HGH Explain Manager - プロジェクト進捗状況（2025-11-18 更新）

## 📊 プロジェクト概要
- **プロジェクト名**: 医療機関向け検査・治療説明動画管理 SaaS  
- **技術スタック**: Next.js 15.5.4（App Router, RSC）+ TypeScript + Tailwind CSS 4 + Prisma + SQLite  
- **開発体制**: 1 名（Cursor + Codex IDE で設計〜実装〜テストまで担当）  
- **推奨環境**: Node.js 20 系 / pnpm 9 系（corepack 経由で管理）  
- **環境変数**: `.env.local` に `DATABASE_URL` 等を格納。`.env.example` を雛形として更新済み

## 🎯 MVP スコープと進捗
| ID | 機能 | 状況 |
| --- | --- | --- |
| F001 | 動画 CRUD（登録・参照・削除） | UI/フォームと Prisma API 連携を実装済み。ファイルアップロードとレビュー導線は未実装 |
| F002 | カテゴリ管理 | UI モックと `/api/categories` GET/POST 完了。並び替え・編集・削除は未実装 |
| F003 | 患者向けタブレット UI | 画面フローは mock-data で動作。DB/API 連携はこれから |
| F004~F010 | オフライン・検索・統計など | 未着手

## 🏗️ アーキテクチャ／実装状況
### ✅ 完了済み
1. **プロジェクト基盤**
   - Next.js + TypeScript + Tailwind CSS + ESLint を設定済み
   - Prisma スキーマ（`Video`, `Category`, `VideoVisibility`）定義済み
   - `pnpm setup:db` で Prisma `generate` + `db push` を一括実行できる Node スクリプト（`scripts/setup-db.mjs`）を整備

2. **UI/UX モック**
   - ルートレイアウト／グローバルスタイル／スタッフ・患者レイアウトとトップページ
   - `/staff`, `/staff/videos`, `/staff/videos/new`, `/staff/categories`
   - `/patient`, `/patient/videos/[videoId]`

3. **API 層**
   - `/api/videos`（GET with filters, POST）
   - `/api/categories`（GET, POST）
   - Prisma Client シングルトン（`src/lib/db.ts`）で `DATABASE_URL` を絶対パス化するガードを追加済み

4. **モックデータ → DB 連携準備**
   - `scripts/seed-db.ts` を追加し、`pnpm db:seed` で mock-data のカテゴリ/動画を SQLite に投入可能

### 🚧 進行中／課題
1. **UI と API の接続**
   - 画面は `mock-data.ts` を参照しており、Prisma からのフェッチ置き換えはこれから
2. **ファイルアップロード設計**
   - `/staff/videos/new` はメタデータ登録のみ。ストレージやサムネイル生成の仕様策定が必要
3. **カテゴリ管理の CRUD 拡張**
   - 並び替え・編集・削除 API と UI の実装
4. **患者向けフローの本番データ化**
   - 公開可否やカテゴリに基づくフィルタリングを API で実装
5. **テスト／品質**
   - `pnpm lint` 以外のスクリプト（`typecheck`, `test:unit`, `test:e2e`）未整備
   - Vitest / Playwright のセットアップとサンプルテストが未着手
6. **PWA / 運用**
   - Manifest, Service Worker, 監視/ログは未着手
7. **文字化け修正**
   - 日本語コピーが Shift_JIS 由来で文字化けしている箇所が残存。順次 UTF-8 で再保存予定

## 📋 直近タスク（優先度順）
1. **ドキュメント／文言整備**
   - 文字化けした UI 文言とドキュメントの修正
2. **データ整備**
   - `pnpm setup:db` → `pnpm db:seed` を CI/README に明記し、環境再現性を確保
3. **UI ↔ Prisma 連携**
   - スタッフダッシュボード・患者画面を Prisma 取得に切り替え
4. **アップロード設計**
   - 保存先／制約／サムネイル生成の方針決定と UI 連携
5. **テスト基盤**
   - Vitest・Playwright の導入と基本ケース作成

## 🧩 技術的課題
1. 認証・認可（MVP フェーズでの簡易認証方式、今後の拡張）  
2. 動画保存／配信（オンプレ NAS/S3/クラウド選定、容量設計、フォーマット対応）  
3. Node バージョン差異（ローカルの 22.x を 20 系へ統一するか要検討）  
4. 文字コード（Shift_JIS 由来のテキスト資産を UTF-8 へ統合する手順）

## 📈 進捗率（目安）
- 全体: **48%**（DB 初期化／seed スクリプト整備により +3pt）  
- UI/UX: 90%（API 連携待ち）  
- データ設計 / Prisma: 85%（マイグレーション + seed まで完了。今後は本番シナリオ対応）  
- API 実装: 55%（動画・カテゴリの GET/POST、seed 用意済み。PATCH/DELETE 未実装）  
- ファイルアップロード: 10%（フォームのみ）  
- テスト: 0%  
- PWA/運用: 0%

## 🎯 マイルストーン（更新）
1. **Week 1-2**: 文字化け修正 / DB 初期化手順の定着 / Seed 自動化（済）  
2. **Week 3-4**: UI ↔ API の接続、動画アップロード設計開始  
3. **Week 5-6**: テスト基盤整備（Vitest + Playwright）  
4. **Week 7-8**: 認証・パフォーマンス・運用監視の設計

## 📝 更新履歴
- 2025-01-12: 初版作成  
- 2025-10-31: 進捗棚卸し・課題整理  
- 2025-11-18: Prisma 環境初期化／シードスクリプト整備、DB アクセス修正を反映

---
進捗に応じて本ドキュメントを継続的に更新してください。

## 🚀 デプロイ・MVP 実装ロードマップ
1. **環境整備フェーズ（〜Week 2）**
   - Node 20 系への統一、`pnpm setup:db` / `pnpm db:seed` の標準化
   - 文字化け修正と README / docs の整備
2. **データ連携フェーズ（Week 3-4）**
   - スタッフ／患者 UI を Prisma/API 連携に置き換え
   - 動画アップロード仕様を決定し、UI と API を接続
3. **品質・拡張フェーズ（Week 5-6）**
   - Vitest / Playwright セットアップ、基本テストケースの実装と CI 連携
   - カテゴリ管理 CRUD の完成（並び替え・編集・削除）
4. **デプロイ準備フェーズ（Week 7-8）**
   - 認証・認可、PWA/パフォーマンス調整、監視・ログの仕組み化
   - Vercel 等へのデプロイ設定、手動確認手順の整備
