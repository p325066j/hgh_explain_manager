# HGH Explain Manager - プロジェクト進捗
最終更新: 2026-05-29

## プロジェクト概要
- **目的**: 医療説明動画の管理・配信（スタッフ管理 / 患者閲覧）
- **想定運用**: 患者はQRコード経由で `/patient` にアクセスし、個人スマホで閲覧
- **技術**: Next.js (App Router / RSC), TypeScript, Tailwind CSS, Prisma, Postgres (Neon)
- **認証**: スタッフはパスワード + 署名付きセッション Cookie（`STAFF_LOGIN_PASSWORD` / `STAFF_SESSION_SECRET`）
- **動画保存**: YouTube（公開）
- **セキュリティ進捗の詳細**: [Security_status.md](./Security_status.md)
- **YouTube 連携運用**: [docs/architecture/youtube-api-guide.md](./docs/architecture/youtube-api-guide.md)

---

## リポジトリ状態（2026-05-29 時点）
- **ブランチ**: `main`（`origin/main` と同期）
- **直近コミット**: `01b1bae` UI編集前（2026年2月頃の MVP 完了後）
- **未コミット変更あり**（作業ツリー）:
  - セキュリティ強化 SEC-001〜003（`staff-auth`、ログイン/API レート制限、Prisma マイグレーション 2 件）
  - UI ガイドライン適用（`globals.css`、患者/スタッフ各画面）
  - YouTube 連携: `youtube.ts` のエラーメッセージ改善、`docs/architecture/youtube-api-guide.md`
  - `Security_status.md` の更新
- **推奨**: `feat/security-and-ui` 等のブランチに分けてコミット → PR（main 直 push は運用ルール上不可）

---

## フェーズ別進捗（MVP）
### フェーズ0: 基盤
- **状態**: 完了（リモート `main`）
- **内容**: Node 20 / pnpm / lint / typecheck / test / E2E セットアップ

### フェーズ1: ドメイン / API
- **状態**: 完了（リモート `main`）
- **内容**: Prisma（Video / Category / VideoCategory / AuditLog）・API実装

### フェーズ2: スタッフUI
- **状態**: 完了（リモート `main`）／UI リファインは作業ツリーで進行中
- **内容**: 動画登録（URL / アップロード）、カテゴリ管理、YouTube設定、監査ログ

### フェーズ3: 患者UI
- **状態**: 完了（リモート `main`）／UI リファインは作業ツリーで進行中
- **内容**: カテゴリ選択、検索、動画詳細（合併症/注意事項の表示）

### フェーズ4: PWA & QA
- **状態**: 完了（リモート `main`）
- **内容**: PWA（manifest / icons / themeColor）と手動QA

---

## 直近の完了事項（リモート main まで）
- Neon Postgres へ移行（`postgresql` datasource / `DIRECT_URL` 追加）
- Prisma migrate 実行（差分なしで同期確認）
- モックデータ投入（カテゴリ6件 / 動画13件）
- Postgres移行後のYouTubeアップロード手動テスト完了
- 合併症/注意事項の登録・表示対応
- MVP 時点の総合テスト（lint / typecheck / unit / e2e）完了

## 直近の完了事項（作業ツリー・未コミット／ローカル検証済み）
- [セキュリティ] API の認証・認可を強化（SEC-001）
- [セキュリティ] スタッフ認証を署名付きセッション Cookie へ移行（SEC-002）
- [セキュリティ] ログイン試行制限とスタッフ API レート制限を実装（SEC-003）
- UI ガイドライン文書の追加（`docs/architecture/ui-guidelines.md`）
- 患者/スタッフ画面へのデザイントークン・共通クラス（`.ui-card` 等）の適用
- **YouTube 連携の復旧・秘密情報管理（SEC-004）**（2026-05-29）
  - OAuth 同意画面を本番環境（In production）へ変更
  - リフレッシュトークンを DB に AES-256-GCM で暗号化保存する方式を実装
  - スタッフ設定 `/staff/settings/youtube` からトークン更新可能に
  - 運用手順書 `docs/architecture/youtube-api-guide.md` を整備
  - `invalid_grant` 時のエラーメッセージを改善（`web/src/lib/youtube.ts`）

---

## 手動確認（2026-05-29・開発環境）
| 項目 | 結果 |
| --- | --- |
| スタッフ画面からの YouTube 動画アップロード | OK |
| 患者画面（`/patient`）での動画再生 | OK |

---

## 進行中
- UI ガイドラインに沿った画面リファインの仕上げ
- セキュリティ・UI・YouTube 関連変更のコミット・PR 化
- SEC-004 本番反映: Vercel 環境変数 + DB へのトークン保存

---

## 未完了 / 残タスク
- **コミット・PR**: 作業ツリー上の変更をリモートへ反映
- SEC-004 本番反映: `YOUTUBE_TOKEN_ENCRYPTION_KEY` 設定と DB へのトークン保存（開発は実装済み）
- セキュリティ課題 SEC-005〜009 — 詳細は [Security_status.md](./Security_status.md)
- PWA アイコンの高解像度差し替え（1024px）
- 操作マニュアルの最終整理（ドキュメント一括整備）
- 本番/ステージングへの Prisma マイグレーション適用（`20260423000000_*` / `20260423010000_*`）
- 本番/ステージング環境への YouTube 認証情報の反映（新リフレッシュトークン・本番用クライアント ID）

---

## テスト状況
| コマンド | 状態 | 備考 |
| --- | --- | --- |
| `pnpm lint` | OK | 2026-05-29、未コミット変更に対して実行 |
| `pnpm typecheck` | OK | 同上 |
| `pnpm test:unit` | OK | 10 tests |
| `pnpm test:e2e` | 要再確認 | MVP 完了時は OK。SEC-003・UI 変更後は未再実行 |
| 手動（YouTube アップロード / 患者再生） | OK | 2026-05-29 開発環境で確認 |

---

## 次にやること
1. 作業ツリーを `feat/*` ブランチにコミットし PR 作成（セキュリティ / UI / YouTube 手順書は可能なら分割）
2. デプロイ環境で Prisma マイグレーション適用と環境変数更新
3. 本番/ステージングに YouTube 認証情報（本番用クライアント ID・リフレッシュトークン）を設定
4. `pnpm test:e2e` を再実行して回帰確認
5. SEC-004 本番反映（Vercel 環境変数・DB トークン保存）
6. PWA アイコン（1024px）差し替え
7. 操作マニュアルの最終整理
8. SEC-005 以降のセキュリティ課題を順次対応
