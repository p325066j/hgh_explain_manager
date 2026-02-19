# Roadmap (MVP)

## 参照ドキュメント
- `docs/architecture/要件定義書.md` に MVP 範囲（F001: 動画管理 / F002: カテゴリ管理 / F003: 患者向け再生 UI）
- `docs/architecture/mvp-initial-backlog.md` に Iteration 0-4 のバックログ
- `docs/architecture/mvp-architecture-outline.md` に App Router 構成
- `status.md` に進捗の最新化

---

## ロードマップ

### フェーズ 0: 基盤整備
**ゴール**: 開発基盤・テスト・DB 初期化を整える
**達成基準**
- Node 20 / pnpm の利用
- `pnpm setup:db` / `pnpm db:seed` の整備
- `pnpm lint` / `pnpm typecheck` / `pnpm test:unit` / `pnpm test:e2e` を実行可能にする
- Prisma + SQLite の初期化

### フェーズ 1: ドメイン / API
**ゴール**: ドメインモデルと API を整える
**達成基準**
- Prisma モデル `Video` / `Category` / `VideoCategory` の整備
- Zod バリデーション整備
- API: `GET/POST /api/videos`, `GET/POST/PATCH/DELETE /api/categories`

### フェーズ 2: スタッフ向け UI
**ゴール**: 管理運用フローの UI を整える
**達成基準**
- `/staff` ダッシュボード
- `/staff/videos` 一覧・公開/非公開切替
- `/staff/videos/new` 登録
- `/staff/categories` 管理
- `/staff/settings/youtube` 一括反映

### フェーズ 3: 患者向け UI
**ゴール**: 視聴フローの UI を整える
**達成基準**
- `/patient` 一覧 + キーワード検索
- `/patient/videos/[id]` 再生 UI
- 404 / エラーハンドリング

### フェーズ 4: PWA & QA
**ゴール**: インストール可能な最小 PWA と QA を完了する
**達成基準**
- Manifest / アイコンを整備
- テスト実行の安定化（Vitest / Playwright）

---

## 未決事項（随時更新）
- 認証方式の拡張（必要なら IdP / Basic Auth 等）
- YouTube Data API での自動アップロード
- Node 20 運用の標準化

---

## MVP 完了条件
- F001-003 が UI / API で稼働
- `pnpm lint` / `pnpm typecheck` / `pnpm test:unit` / `pnpm test:e2e` が通過
- スタッフ登録 → 患者視聴の主要フローを E2E で確認可能