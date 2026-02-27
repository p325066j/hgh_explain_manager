## Requirements

- Node.js 20.x・・.nvmrc` 縺ｫ蜷医ｏ縺帙※ `nvm use` 縺ｧ蛻・ｊ譖ｿ縺域耳螂ｨ・・- pnpm 9.x・・corepack enable` 縺ｧ莉伜ｱ槭・ pnpm 繧貞茜逕ｨ・・- PostgreSQL・医Ο繝ｼ繧ｫ繝ｫ `Neon Postgres` 繧貞茜逕ｨ・・
## Local Setup

1. Node 繝舌・繧ｸ繝ｧ繝ｳ繧貞粋繧上○繧・   ```bash
   nvm use
   corepack enable
   ```
2. 萓晏ｭ倬未菫ゅ・繧､繝ｳ繧ｹ繝医・繝ｫ
   ```bash
   corepack pnpm install
   ```
3. 迺ｰ蠅・､画焚繝輔ぃ繧､繝ｫ繧堤畑諢・   ```bash
   cp .env.example .env.local
   ```
4. 繝・・繧ｿ繝吶・繧ｹ蛻晄悄蛹厄ｼ・risma generate + db push・・   ```bash
   corepack pnpm setup:db
   ```
5. 繝繝溘・繝・・繧ｿ謚募・・・ock-data 縺ｨ蜷檎ｭ峨・繝ｬ繧ｳ繝ｼ繝会ｼ・   ```bash
   corepack pnpm db:seed
   ```
6. 髢狗匱繧ｵ繝ｼ繝舌・
   ```bash
   corepack pnpm dev
   ```

## Useful Scripts

| 繧ｳ繝槭Φ繝・| 隱ｬ譏・|
| --- | --- |
| `pnpm dev` | Next.js 髢狗匱繧ｵ繝ｼ繝舌・・・ttp://localhost:3000・・|
| `pnpm lint` | ESLint 繧貞ｮ溯｡鯉ｼ・--max-warnings=0` 縺ｧ隴ｦ蜻翫ｂ讀懷・・・|
| `pnpm typecheck` | TypeScript 縺ｮ蝙九メ繧ｧ繝・け・・tsc --noEmit`・・|
| `pnpm test:unit` | Vitest 繧貞ｮ溯｡鯉ｼ・--watch` 縺ｧ逶｣隕悶Δ繝ｼ繝会ｼ・|
| `pnpm test:e2e` | Playwright 繧貞ｮ溯｡鯉ｼ井ｸｻ隕√ヶ繝ｩ繧ｦ繧ｶ縺ｧ荳ｦ蛻暦ｼ・|
| `pnpm setup:db` | `scripts/setup-db.mjs` 邨檎罰縺ｧ Prisma generate + db push |
| `pnpm db:seed` | mock 繝・・繧ｿ繧・PostgreSQL 縺ｫ謚募・ |
| `pnpm prisma:generate` | Prisma Client 縺ｮ縺ｿ蜀咲函謌・|
| `pnpm prisma:migrate` | Prisma Migrate 髢狗匱繝輔Ο繝ｼ |

## Environment Variables

- `.env.local` 繧剃ｽｿ逕ｨ・・.env` 縺ｫ縺ｯ鄂ｮ縺九↑縺・ｼ・ 
- 譌｢螳壹・ `DATABASE_URL` 縺ｯ `postgresql://USER:PASSWORD@HOST:PORT/DB?sslmode=require`  
- 莉悶・讖溷ｯ・ュ蝣ｱ繧定ｿｽ蜉縺吶ｋ髫帙・ `.env.example` 繧ょｿ倥ｌ縺壹↓譖ｴ譁ｰ

## Additional Docs

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)

譛ｬ逡ｪ繝・・繝ｭ繧､縺ｯ Vercel 繧呈Φ螳壹＠縺ｦ縺・∪縺吶Ａpnpm build` 竊・`pnpm start` 縺ｧ蜍穂ｽ懃｢ｺ隱阪・縺・∴縲∝ｿ・ｦ√↓蠢懊§縺ｦ Vercel 縺ｧ譁ｰ迺ｰ蠅・ｒ菴懈・縺励※縺上□縺輔＞縲・