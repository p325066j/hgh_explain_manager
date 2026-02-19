## Requirements

- Node.js 20.x（`.nvmrc` に合わせて `nvm use` で切り替え推奨）
- pnpm 9.x（`corepack enable` で付属の pnpm を利用）
- SQLite（ローカル `web/prisma/dev.db` を利用）

## Local Setup

1. Node バージョンを合わせる
   ```bash
   nvm use
   corepack enable
   ```
2. 依存関係のインストール
   ```bash
   corepack pnpm install
   ```
3. 環境変数ファイルを用意
   ```bash
   cp .env.example .env.local
   ```
4. データベース初期化（Prisma generate + db push）
   ```bash
   corepack pnpm setup:db
   ```
5. ダミーデータ投入（mock-data と同等のレコード）
   ```bash
   corepack pnpm db:seed
   ```
6. 開発サーバー
   ```bash
   corepack pnpm dev
   ```

## Useful Scripts

| コマンド | 説明 |
| --- | --- |
| `pnpm dev` | Next.js 開発サーバー（http://localhost:3000） |
| `pnpm lint` | ESLint を実行（`--max-warnings=0` で警告も検出） |
| `pnpm typecheck` | TypeScript の型チェック（`tsc --noEmit`） |
| `pnpm test:unit` | Vitest を実行（`--watch` で監視モード） |
| `pnpm test:e2e` | Playwright を実行（主要ブラウザで並列） |
| `pnpm setup:db` | `scripts/setup-db.mjs` 経由で Prisma generate + db push |
| `pnpm db:seed` | mock データを SQLite に投入 |
| `pnpm prisma:generate` | Prisma Client のみ再生成 |
| `pnpm prisma:migrate` | Prisma Migrate 開発フロー |

## Environment Variables

- `.env.local` を使用（`.env` には置かない）  
- 既定の `DATABASE_URL` は `file:./prisma/dev.db`  
- 他の機密情報を追加する際は `.env.example` も忘れずに更新

## Additional Docs

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

本番デプロイは Vercel を想定しています。`pnpm build` → `pnpm start` で動作確認のうえ、必要に応じて Vercel で新環境を作成してください。
