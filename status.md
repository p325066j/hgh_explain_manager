# HGH Explain Manager - プロジェクト進捗（2026-02-26）
最終更新: 2026-02-26

## プロジェクト概要
- **目的**: 医療説明動画の管理・配信（スタッフ管理 / 患者閲覧）
- **想定運用**: 患者はQRコード経由で `/patient` にアクセスし、個人スマホで閲覧
- **技術**: Next.js (App Router / RSC), TypeScript, Tailwind CSS, Prisma, Postgres (Neon)
- **認証**: スタッフは簡易パスコード
- **動画保存**: YouTube（公開）

---

## フェーズ別進捗（MVP）
### フェーズ0: 基盤
- **状態**: 完了
- **内容**: Node 20 / pnpm / lint / typecheck / test / E2E セットアップ

### フェーズ1: ドメイン / API
- **状態**: 完了
- **内容**: Prisma（Video / Category / VideoCategory / AuditLog）・API実装

### フェーズ2: スタッフUI
- **状態**: 完了
- **内容**: 動画登録（URL / アップロード）、カテゴリ管理、YouTube設定、監査ログ

### フェーズ3: 患者UI
- **状態**: 完了
- **内容**: カテゴリ選択、検索、動画詳細（合併症/注意事項の表示を追加）

### フェーズ4: PWA & QA
- **状態**: 完了
- **内容**: PWA（manifest / icons / themeColor）と手動QA

---

## 直近の完了事項
- Neon Postgres へ移行（`postgresql` datasource / `DIRECT_URL` 追加）
- Prisma migrate 実行（差分なしで同期確認）
- モックデータ投入（カテゴリ6件 / 動画13件）
- Postgres移行後のYouTubeアップロード手動テスト完了
- 合併症/注意事項の登録・表示対応
- 総合テスト（lint/typecheck/unit/e2e）完了

---

## 未完了 / 残タスク
- YouTube OAuth / Secret Manager の運用手順ドキュメント化
- PWAアイコンの高解像度差し替え（1024px）
- 操作マニュアルの最終整理（ドキュメント一括整備）

---

## テスト状況
- `pnpm lint`: OK
- `pnpm typecheck`: OK
- `pnpm test:unit`: OK
- `pnpm test:e2e`: OK

---

## 次にやること
1. YouTube連携運用手順のドキュメント化
2. PWAアイコン（1024px）差し替え
3. 操作マニュアルの最終整理