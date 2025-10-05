# MVP Initial Backlog

## Iteration 0 – Foundation
1. Align Node version to 20.x (nvm-windows or Volta) per開発規約。
2. Add project scripts: `lint`, `typecheck`, `test:unit`, `test:e2e` (stubs for now)。
3. Introduce Vitest + Playwright configs (no specs yet)。
4. Set up Prisma + SQLite, update `.env.example` / `.env.local`。

## Iteration 1 – Domain & API
1. Define Prisma models (`Video`, `Category`) and run first migration。
2. Implement Zod schemas for create/update/list requests。
3. Build `POST /api/videos` (metadata only, file upload stub)。
4. Build `GET /api/videos` with filters (category, keyword)。
5. Build `GET /api/categories` & `POST /api/categories`。

## Iteration 2 – Staff Experience
1. Staff layout + navigation shell。
2. Video upload form (step1 metadata, step2 file) using server actions。
3. Category management table (order editing)。
4. Success + error toasts via accessible alert components。

## Iteration 3 – Patient Experience
1. Patient layout (full-screen, large touch targets)。
2. Category grid page with quick filters。
3. Video detail page with custom player controls。
4. Basic offline guard (network error messaging)。

## Iteration 4 – PWA & QA
1. Web manifest + icons + `next-pwa` configuration。
2. Service Worker caching strategy (app shell + video fallback message)。
3. Write baseline Vitest specs (validators, helpers)。
4. Create Playwright smoke tests for staff/patient flows。

## Clarifications Needed
- **Authentication**: Staff向け画面の認証手段 (簡易パスコード/IdP/Basic Auth?)。
- **動画保存先**: MVP段階で院内NAS等かローカルディスクか、もしくはクラウド(S3等)。
- **アップロード制限**: ファイルサイズ上限・対応フォーマット (mp4/h264?)。
- **患者端末**: 単一端末の想定か複数端末同期が必要か。
- **Node バージョン**: 現在 Node 22.12.0 が入っているが、Node 20 系へ切り替える必要があるか。
