# MVP Architecture Outline

## Scope Alignment
- **MVP focus**: F001 動画管理システム, F002 カテゴリ分類機能, F003 タブレット最適化再生。
- **非範囲**: F004 以降 (オフライン、A11y拡張、多言語、分析等) はバックログとして保持。
- **ユーザーフロー**:
  1. 医療スタッフが YouTube URL + メタ情報(タイトル/説明/カテゴリ)を登録。
  2. カテゴリごとに並び順を調整し、公開/非公開を一括反映。
  3. 患者がカテゴリ選択 → 動画一覧 → 詳細視聴。

## Next.js レイヤー構成
- **App Router**: `app/` 直下に role セグメントを定義。
  - `/(staff)` レイアウト: 認証前提の管理 UI (dashboard, video upload, category manager)。
  - `/patient` レイアウト: タブレット想定のフルスクリーン動画ブラウズ/再生。
  - 共有 UI コンポーネントは `src/components/` でサーバーコンポーネントをデフォルトにし、操作が必要な箇所のみクライアント化。
- **Metadata + Routing**:
  - 患者向けトップ `/patient` ではカテゴリ選択 → 動画一覧 → 詳細。
  - 動画詳細 `/patient/videos/[videoId]` はタブレット操作用 UI。
  - スタッフ向け `/staff/videos`, `/staff/videos/new`, `/staff/categories`, `/staff/settings/youtube` を server actions + form で構築。

## データ/ドメイン設計
- **メインエンティティ**
  - `Video`: id (YouTube videoId), title, description, fileUrl, thumbnailUrl, duration, procedures, isVisible, isArchived, updatedAt, createdAt
  - `Category`: id, name, slug, order, createdAt, updatedAt
  - `VideoCategory` (中間): videoId, categoryId, order
  - `ViewLog` (backlog): patientId?, videoId, deviceId, viewedAt, completedRatio
- **バリデーション**
  - API 入出力は Zod schema を `src/lib/validators/` に集約。
  - サーバー側でフォーム投稿を Zod parse → domain DTO 変換。
- **ストレージ方針**
  - メタ情報は Prisma + Postgres で保持。
  - 動画本体は YouTube に保存し、アプリは URL を埋め込み再生。
  - 初期は URL の手動登録、将来は YouTube Data API による自動アップロードを追加。

## サービス/ヘルパー
- `src/lib/db` : Prisma client, repository helper。
- `src/lib/youtube` : YouTube 埋め込み URL 生成、メタ同期ロジック（計画）。
- `src/lib/crypto` : OAuth トークン暗号化/復号（計画）。

## テスト戦略
- **ユニット (Vitest)**: Zod schema・サーバー util の検証。
- **コンポーネントテスト**: Playwright component も検討。MVPでは Vitest + @testing-library/react。
- **E2E (Playwright)**: 患者フロー (カテゴリ→視聴)、スタッフフロー (登録→一覧反映) の happy path を最低 2 ケース。

## 初期タスク分解
1. **基盤整備**
   - Prisma + Postgres 初期化、環境変数 `.env.local` 雛形更新。
   - ESLint/Vitest/Playwright 設定を repo 要件に合わせて再確認。
2. **ドメインモデル & バリデーション**
   - `Video` / `Category` / `VideoCategory` の Prisma schema 作成 → マイグレーション。
   - Zod schema (create/update payload, list filters)。
3. **API 実装**
   - `POST /api/videos` : YouTube URL 登録 + メタ登録。
   - `GET /api/videos` : フィルタ/カテゴリ/キーワードでの取得。
   - `GET /api/categories`, `POST /api/categories`。
4. **スタッフ UI**
   - `/staff` dashboard: KPI/操作導線。
   - `/staff/videos/new`: 手動 URL 登録フォーム。
   - `/staff/categories`: 並び替え UI, order 更新。
   - `/staff/settings/youtube`: 連携/一括反映。
5. **患者 UI**
   - `/patient`: カテゴリ選択 → 動画一覧。
   - `/patient/videos/[id]`: YouTube 埋め込み再生 + 詳細表示。
6. **同期/反映**
   - Cloud Scheduler → 内部 API でメタ同期。
   - 公開/非公開の一括反映。
7. **テスト/チェックス**
   - Vitest ベースセット (schemas, helpers)。
   - Playwright baseline scripts。
   - Lint/typecheck/test scriptsを `package.json` に整備。

## 決定事項（2026-01-29）
### 認証・運用
- **認証方式**: 簡易パスコード
- **パスコード管理**: 固定（環境変数）
- **ログイン方法**: パスコードのみ
- **有効期限/ロック**: 期限なし、連続失敗制限なし
- **管理者**: 1名固定、スタッフ削除/無効化は MVP 不要

### Node/環境
- **Node 20 運用**: Volta で固定

### YouTube 連携
- **保存先**: YouTube（公開）にアップロードしアプリ内埋め込み
- **アップロード経路**: 初期は手動 URL 登録のみ、将来自動アップロード前提
- **URL 許可形式**: youtube.com / youtu.be 両方
- **自動アップロード方式**: YouTube Data API（OAuth 2.0）
- **アカウント**: アプリ専用 YouTube アカウント
- **OAuth 運用**: 管理者が一度連携してトークン保持
- **トークン保存**: サーバー側（DB）
- **暗号化**: アプリ内で暗号化、キーは外部管理
- **外部キー管理**: GCP Secret Manager
- **連携画面**: /staff/settings/youtube（管理者のみ）
- **失効時**: 連携画面へ自動遷移、警告バナー表示
- **権限**: 動画アップロード/編集/削除

### 動画登録・表示
- **登録フロー**: YouTube URL + タイトル/説明/カテゴリ（必須）
- **説明**: 必須
- **カテゴリ**: 複数指定（タグ運用）、フラット構造、上限なし
- **カテゴリ並び**: 初期は名前順、管理者が手動で並び替え可能
- **カテゴリ削除**: 該当動画からカテゴリを外す
- **検索対象**: タイトル + 説明
- **患者フロー**: カテゴリ選択 → 動画一覧

### 公開/反映
- **公開フラグ**: アプリ側で表示/非表示を持つ
- **表示順**: 管理者が指定（カテゴリごと）
- **反映方式**: 手動の一括反映、対象は変更があった動画のみ
- **反映条件**: 公開/非公開フラグのみ
- **反映権限**: スタッフ全員
- **反映実行**: 非同期ジョブ、即時実行、結果は詳細ログ表示
- **ジョブ保存**: Job テーブルなし（既存ログで簡易運用）
- **失敗時**: 失敗動画のみリトライ、API エラー理由を表示

### データ/同期
- **動画ID**: YouTube の videoId を主キー
- **削除ポリシー**: アプリ側のみ削除（YouTube は削除しない）
- **編集対象**: アプリ内メタのみ（タイトル/説明/カテゴリ/表示フラグ）
- **ソフト削除**: isArchived
- **非表示フラグ**: isVisible
- **YouTube 削除**: リンク切れ表示で残す
- **YouTube メタ**: タイトル/説明は同期して上書き
- **同期方式**: 1日1回の自動同期
- **リンク切れ検出**: 同期時にチェック
- **同期実行**: GCP Cloud Scheduler + API
- **同期対象**: 全動画
- **Scheduler 認証**: 共有シークレット（ヘッダー）
- **同期 API**: 内部のみ

### 画面表示
- **スタッフ一覧**: タイトル/カテゴリ/公開状態/更新日時 + YouTube 公開状態 + 反映ステータス
- **患者詳細**: 埋め込み + タイトル/説明/カテゴリ

## オープンポイント
- YouTube OAuth クライアント/Secret Manager の具体設定手順を整理する。
- 一括反映の非同期実行基盤（ジョブ管理/ログ設計）を確定する。
- 多対多カテゴリの UI/UX と並び順の詳細仕様を詰める。
