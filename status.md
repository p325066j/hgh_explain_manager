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
- **直近コミット**: `d8dbb1c` SEC-005 / `26c217f` SEC-004 / `12440e3` SEC-001〜003・UI
- **作業ツリー**: クリーン
- **`origin/main`**: 1 コミット先行（SEC-005）。push または PR で反映

---

## フェーズ別進捗（MVP）
### フェーズ0〜4
- **状態**: 完了（`main` 反映済み）
- SEC-001〜004・UI リファインも `main` に含まれる

---

## 直近の完了事項

### リモート `main` 反映済み
- SEC-001〜003（スタッフ認証・API 認可・レート制限）
- SEC-004（YouTube 秘密情報の DB 暗号化保存・運用手順書）
- UI ガイドライン適用

### ローカル `main`（`d8dbb1c`・手動確認済み）
- **SEC-005** アップロード DoS 耐性（2026-05-29）
  - 500MB 上限、形式検証、ストリーム送信、タイムアウト
  - 開発環境で手動確認完了

---

## 手動確認（2026-05-29・開発環境）

| 項目 | 結果 |
| --- | --- |
| スタッフ画面からの YouTube 動画アップロード | OK |
| 患者画面（`/patient`）での動画再生 | OK |
| SEC-005: 通常 MP4 アップロード | OK |
| SEC-005: 上限超過・非対応形式の拒否 | OK |

---

## 進行中
- SEC-005 の push / PR
- SEC-004 本番反映（Vercel 環境変数 + DB トークン保存）

---

## 未完了 / 残タスク
- **push / PR**: SEC-005 を `origin/main` へ反映
- SEC-004 本番反映（`YOUTUBE_TOKEN_ENCRYPTION_KEY`、DB トークン保存）
- セキュリティ SEC-006〜009 — [Security_status.md](./Security_status.md)
- PWA アイコン 1024px 差し替え
- 操作マニュアル整理
- `pnpm test:e2e` 再実行

---

## テスト状況

| コマンド | 状態 | 備考 |
| --- | --- | --- |
| `pnpm lint` | OK | SEC-005 実装時 |
| `pnpm typecheck` | OK | 同上 |
| `pnpm test:unit` | OK | 17 tests（`video-upload-limits` 含む） |
| `pnpm test:e2e` | 要再確認 | SEC-003 以降未再実行 |
| 手動（アップロード / 再生 / SEC-005） | OK | 2026-05-29 |

---

## 次にやること
1. SEC-005 を push し PR 作成（必要な場合）
2. `pnpm test:e2e` で回帰確認
3. SEC-004 本番反映（Vercel / Neon）
4. SEC-006 セキュリティヘッダ整備に着手
5. PWA アイコン・操作マニュアル整理
