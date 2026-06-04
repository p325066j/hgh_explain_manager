# HGH Explain Manager - セキュリティ強化ステータス
最終更新: 2026-05-29

## 文書の目的
- 本サービスにおけるセキュリティ課題を一覧化し、対応状況を追跡する。
- 優先度の高い問題から順に解消し、実装・テスト・レビューの進捗を見える化する。

---

## 実装とリポジトリの位置づけ
- **ブランチ**: `main`（`origin/main` と同期、作業ツリーはクリーン）
- **直近コミット**:
  - `e78da10` — SEC-005 ドキュメント更新 / `d8dbb1c` — SEC-005 実装
  - `26c217f` — SEC-004（YouTube 暗号化 DB 保存、手順書、設定 UI、CLI）
  - `12440e3` — SEC-001〜003、UI ガイドライン、スタッフ認証・レート制限
- **SEC-001〜005**: `origin/main` に反映済み（2026-06-03）
- **本番・ステージングへ残る作業**: `prisma migrate deploy`、環境変数設定（`.env.example` / [youtube-api-guide.md](./docs/architecture/youtube-api-guide.md) 参照）、YouTube トークンの DB 保存

---

## 前提
- サービス種別: 医療説明動画の管理・配信システム。
- 患者個人情報を保持する構成ではないが、医療機関向けの管理機能と公開制御を持つ。
- 管理画面、管理 API、YouTube 連携の秘密情報は中〜高水準の保護が必要。
- 患者向け画面は公開動画の閲覧を前提にするが、非公開動画・監査ログ・管理操作は外部公開しない。

---

## セキュリティ課題一覧

| ID | 優先度 | 状態 | 課題 | 概要 |
| --- | --- | --- | --- | --- |
| SEC-001 | Critical | 完了 | API の認証・認可不足 | `/api/*` をスタッフ認証必須にし、未認証は `401` で拒否 |
| SEC-002 | Critical | 完了 | スタッフ認証方式が脆弱 | 固定フラグ Cookie を廃止し、HMAC 署名付き・有効期限付きセッション Cookie へ移行 |
| SEC-003 | High | 完了 | ログイン試行制限・レート制限なし | ログイン 5 回/15 分ブロック、スタッフ API の IP+メソッド+パス単位レート制限 |
| SEC-004 | High | 完了 | YouTube 秘密情報管理 | リフレッシュトークンを DB 暗号化保存。クライアント秘密情報は Vercel 環境変数。運用手順書整備済み |
| SEC-005 | High | 完了 | アップロード処理の DoS 耐性不足 | サイズ/MIME/拡張子/マジックバイト検証、ストリーム送信、タイムアウト、bodySizeLimit 調整 |
| SEC-006 | Medium | 未着手 | セキュリティヘッダ未整備 | CSP、HSTS、Referrer-Policy、クリックジャッキング対策がない |
| SEC-007 | Medium | 未着手 | 監査ログの追跡性不足 | 誰が・どの経路で操作したかを十分に残せていない |
| SEC-008 | Medium | 未着手 | 内部 API 用の認証設計が未実装 | Scheduler / バッチ用の内部 API 認証が仕様止まり |
| SEC-009 | Medium | 未着手 | 公開範囲の運用境界が曖昧 | YouTube 公開前提と院内限定利用の期待にズレが生じる可能性がある |

---

## 対応履歴

### 2026-05-29: SEC-005 アップロード処理の DoS 耐性不足
- 状態: **完了**（`origin/main` 反映済み: `e78da10`。手動確認済み）。
- 対応内容:
  - `web/src/lib/video-upload-limits.ts` で上限（デフォルト 500MB・要件定義準拠）、拡張子/MIME/先頭バイト検証を集約。
  - Server Action（`upload/page.tsx`）と `uploadYouTubeVideo` の二重検証。
  - YouTube への PUT を `arrayBuffer()` 一括読み込みから `file.stream()` ストリーミングへ変更。
  - アップロード全体に `AbortSignal.timeout`（デフォルト 15 分、`VIDEO_UPLOAD_TIMEOUT_MS` で変更可）。
  - `next.config.ts` の `bodySizeLimit` を 200mb から上限+余裕（約 520mb）へ調整。
  - クライアントフォームに形式・上限の表示とサイズの事前チェックを追加。
- 主な変更ファイル:
  - `web/src/lib/video-upload-limits.ts`
  - `web/src/lib/youtube.ts`
  - `web/src/app/(staff)/staff/videos/upload/page.tsx`
  - `web/src/app/(staff)/staff/videos/upload/upload-form.tsx`
  - `web/next.config.ts`
- 検証結果:
  - `pnpm lint` / `pnpm typecheck` / `pnpm test:unit`: OK（`video-upload-limits.spec.ts` 含む）
  - 手動（開発環境）: 通常 MP4 アップロード OK、上限超過・非対応形式の拒否 OK

### 2026-05-29: SEC-004 YouTube 秘密情報管理（完了）
- 状態: **完了**（`main` 反映済み: `26c217f`）。開発環境でアップロード・患者再生を手動確認済み。
- 対応内容:
  - `YouTubeCredential` モデルを追加し、リフレッシュトークンを AES-256-GCM で暗号化して Postgres に保存。
  - `YOUTUBE_TOKEN_ENCRYPTION_KEY`（32文字以上）で復号。平文の env 直置きは移行用フォールバックのみ。
  - `web/src/lib/youtube-credentials.ts` に認証情報取得を集約。
  - スタッフ画面 `/staff/settings/youtube` からトークンを暗号化保存可能に。
  - CLI `pnpm youtube:import-token` で env から DB へインポート可能に。
  - `docs/architecture/youtube-api-guide.md` に開発・本番（Vercel）手順を整備。
  - `web/src/lib/youtube.ts` で `invalid_grant` 時に再認証手順を示すエラーメッセージを追加。
- 保管方針:
  - クライアント ID / シークレット: ホスティングの暗号化環境変数（Vercel 等）
  - リフレッシュトークン: DB 暗号化（Google Secret Manager は GCP 常時ホスト時の将来オプション）
- 検証結果:
  - `prisma migrate deploy`: OK（`20260529100000_add_youtube_credential`）
  - `pnpm lint` / `pnpm typecheck` / `pnpm test:unit`: OK
  - 手動: スタッフ画面からの YouTube アップロード OK、患者画面での動画再生 OK
- 受入基準の達成:
  - 平文リフレッシュトークンの恒常保管を DB 暗号化へ移行する設計を実装
  - ローテーション手順を文書化
  - 開発環境で E2E に近い手動確認を実施

### 2026-05-29: SEC-004 付記（トークン失効・運用復旧）
- OAuth 同意画面を **本番環境（In production）** に変更（テスト公開時の 7 日失効を防止）。
- 失効時は Playground で再取得し、スタッフ設定画面または CLI で DB に再保存。

### 2026-04-23: SEC-003 ログイン試行制限・レート制限なし
- 状態: **完了**（`main` 反映済み: `12440e3`）。
- 対応内容:
  - スタッフ入力用の認証情報を `STAFF_LOGIN_PASSWORD` に変更し、セッション署名鍵 `STAFF_SESSION_SECRET` と役割を分離。
  - 旧 `STAFF_PASSCODE` は移行用フォールバックとして暫定対応。
  - `StaffLoginRateLimit` / `StaffApiRateLimit` モデルとマイグレーション 2 件を追加。
  - ログイン 5 回/15 分ブロック、API レート制限（`429` + `Retry-After`）。
- 主な変更ファイル:
  - `web/src/lib/staff-login-rate-limit.ts`
  - `web/src/lib/staff-api-rate-limit.ts`
  - `web/src/lib/staff-password.ts`
  - `web/src/middleware.ts`
- 検証結果:
  - `pnpm lint` / `pnpm typecheck` / `pnpm test:unit`: OK（2026-05-29 再確認）
  - `pnpm test:e2e`: SEC-003 反映後は未再実行

### 2026-04-15: SEC-002 スタッフ認証方式が脆弱
- 状態: **完了**（`main` 反映済み: `12440e3`）。
- 主な変更ファイル: `web/src/lib/staff-auth.ts`

### 2026-04-15: SEC-001 API の認証・認可不足
- 状態: **完了**（`main` 反映済み: `12440e3`）。
- 主な変更ファイル: `web/src/lib/staff-auth.ts`, `web/src/middleware.ts`, 各 API ルート

---

## 完了課題の残運用タスク（SEC-004）

実装は完了しているが、**デプロイ先ごと**に以下が必要です。

| 環境 | 作業 |
| --- | --- |
| 開発 | `YOUTUBE_TOKEN_ENCRYPTION_KEY` を `.env.local` に設定し、`/staff/settings/youtube` または `pnpm youtube:import-token` でトークンを DB 保存 |
| 本番 | Vercel に `YOUTUBE_CLIENT_ID` / `YOUTUBE_CLIENT_SECRET` / `YOUTUBE_TOKEN_ENCRYPTION_KEY` を設定。Neon で `prisma migrate deploy` 後、本番 DB にトークン保存。**`YOUTUBE_REFRESH_TOKEN` は本番 env に置かない** |

詳細: [docs/architecture/youtube-api-guide.md](./docs/architecture/youtube-api-guide.md)

---

## 未対応課題詳細

### SEC-006 セキュリティヘッダ未整備
- 状態: 未着手。
- 問題:
  - CSP、HSTS、X-Frame-Options 相当、Referrer-Policy などが未設定。
- 想定対応:
  - Next.js 側で共通ヘッダを設定。
  - YouTube 埋め込みとの整合を取った CSP を設計。

### SEC-007 監査ログの追跡性不足
- 状態: 未着手。
- 問題:
  - 操作主体、セッション、IP、User-Agent などの情報が足りない。
  - インシデント時の調査に不十分。
- 想定対応:
  - 監査ログ項目を拡張。
  - 認証・失敗イベントも記録対象に追加。

### SEC-008 内部 API 用の認証設計が未実装
- 状態: 未着手。
- 問題:
  - Scheduler 用共有シークレットの仕様はあるが、実装が未整備。
  - 内部専用 API の境界が不明確。
- 想定対応:
  - 内部 API 専用の認証方式を実装。
  - 外部公開 API と経路を分離。

### SEC-009 公開範囲の運用境界が曖昧
- 状態: 未着手。
- 問題:
  - YouTube 公開前提の仕様と、院内限定に見える期待値が衝突する可能性がある。
- 想定対応:
  - 「一般公開」「限定共有」「院内限定」のどれを目指すか明文化。
  - 要件次第で動画配信方式を再検討。

---

## 優先対応順
1. 各環境で `prisma migrate deploy` とスタッフ / YouTube 環境変数の設定（SEC-004 残運用）
2. `pnpm test:e2e` で SEC-001〜003 の回帰確認
3. SEC-006 セキュリティヘッダ未整備
4. SEC-007 監査ログの追跡性不足
5. SEC-008 内部 API 用の認証設計が未実装
6. SEC-009 公開範囲の運用境界が曖昧

---

## 進捗サマリー
- **完了（`origin/main` 反映済み）**: 5 / 9（SEC-001〜005）
- **未着手**: 4 / 9（SEC-006〜009）
- **次のセキュリティ実装**: SEC-006

---

## 次アクション
1. PR #1 が Open のままなら GitHub 上でクローズする（内容は `main` に取り込み済み）。
2. 本番・ステージングで `prisma migrate deploy` と環境変数を設定する（[youtube-api-guide.md](./docs/architecture/youtube-api-guide.md)）。
3. `pnpm test:e2e` を実行し、認証・レート制限・アップロードまわりの回帰を確認する。
4. 本番（Vercel）で SEC-005 のアップロード動作を確認する。
5. SEC-006 セキュリティヘッダ整備に着手する。
