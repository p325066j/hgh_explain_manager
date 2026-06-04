# HGH Explain Manager - プロジェクト進捗
最終更新: 2026-06-03

## プロジェクト概要
- **目的**: 医療説明動画の管理・配信（スタッフ管理 / 患者閲覧）
- **想定運用**: 患者はQRコード経由で `/patient` にアクセスし、個人スマホで閲覧
- **技術**: Next.js (App Router / RSC), TypeScript, Tailwind CSS, Prisma, Postgres (Neon)
- **認証**: スタッフはパスワード + 署名付きセッション Cookie（`STAFF_LOGIN_PASSWORD` / `STAFF_SESSION_SECRET`）
- **動画保存**: YouTube（公開）
- **セキュリティ進捗の詳細**: [Security_status.md](./Security_status.md)
- **YouTube 連携運用**: [docs/architecture/youtube-api-guide.md](./docs/architecture/youtube-api-guide.md)

---

## リポジトリ状態（2026-06-03 時点）
- **ブランチ**: `main`（`origin/main` と同期）
- **直近コミット**: `e78da10` SEC-005 / `26c217f` SEC-004 / `12440e3` SEC-001〜003・UI
- **作業ツリー**: クリーン

---

## フェーズ別進捗（MVP）
### フェーズ0〜4
- **状態**: 完了（`origin/main` 反映済み）

---

## 直近の完了事項（`origin/main` 反映済み）
- SEC-001〜003（スタッフ認証・API 認可・レート制限）
- SEC-004（YouTube 秘密情報の DB 暗号化保存・運用手順書）
- **SEC-005**（動画アップロード DoS 耐性・2026-06-03 反映）
  - 500MB 上限、形式検証、ストリーム送信、タイムアウト
  - 開発環境で手動確認完了
- UI ガイドライン適用

---

## 手動確認（開発環境）

| 項目 | 結果 |
| --- | --- |
| スタッフ画面からの YouTube 動画アップロード | OK |
| 患者画面（`/patient`）での動画再生 | OK |
| SEC-005: 通常 MP4 アップロード | OK |
| SEC-005: 上限超過・非対応形式の拒否 | OK |

---

## 進行中
- SEC-004 本番反映（Vercel 環境変数 + DB トークン保存）
- 本番（Vercel）での SEC-005 動作確認（`main` デプロイ後）

---

## 未完了 / 残タスク
- SEC-004 本番反映（`YOUTUBE_TOKEN_ENCRYPTION_KEY`、DB トークン保存）
- セキュリティ SEC-006〜009 — [Security_status.md](./Security_status.md)
- `pnpm test:e2e` 再実行
- PWA アイコン 1024px 差し替え
- 操作マニュアル整理

---

## テスト状況

| コマンド | 状態 | 備考 |
| --- | --- | --- |
| `pnpm lint` | OK | SEC-005 実装時 |
| `pnpm typecheck` | OK | 同上 |
| `pnpm test:unit` | OK | 17 tests |
| `pnpm test:e2e` | 要再確認 | SEC-005 反映後未再実行 |
| 手動（アップロード / 再生 / SEC-005） | OK | 開発環境 |

---

## 次にやること
1. Vercel の本番デプロイ完了後、本番でアップロードを確認
2. `pnpm test:e2e` で回帰確認
3. SEC-004 本番反映（Vercel / Neon）
4. SEC-006 セキュリティヘッダ整備に着手
