# YouTube 連携運用手順（SEC-004）

## 概要

本システムでは、スタッフがアップロードした動画を YouTube Data API v3 経由で YouTube チャンネルに保存します。
認証情報の保管方針は次のとおりです。

| 種別 | 保管場所 | 備考 |
| --- | --- | --- |
| クライアント ID / シークレット | 環境変数（Vercel 等） | ホスティング側の暗号化環境変数を利用 |
| リフレッシュトークン | Postgres（AES-256-GCM 暗号化） | `YOUTUBE_TOKEN_ENCRYPTION_KEY` で復号 |
| アクセストークン | 都度 API で取得 | 保存しない |

---

## 1. Google Cloud Console の初期設定（初回のみ）

1. [Google Cloud Console](https://console.cloud.google.com/) にアクセスし、対象プロジェクトを選択します。
2. **YouTube Data API v3 の有効化**
   - 左メニュー「API とサービス」>「ライブラリ」から `YouTube Data API v3` を検索し、「有効にする」をクリックします。
3. **OAuth 同意画面の設定**
   - 左メニュー「API とサービス」>「OAuth 同意画面」を開きます。
   - 「公開ステータス」を **「本番環境 (In production)」** に設定します。
   - ※「テスト中 (Testing)」のままだと、リフレッシュトークンが **7日間で失効** します。
4. **OAuth 2.0 クライアントの作成**
   - 左メニュー「認証情報」>「＋ 認証情報を作成」>「OAuth クライアント ID」を選択します。
   - アプリケーションの種類: `ウェブ アプリケーション`
   - 承認済みのリダイレクト URI: `https://developers.google.com/oauthplayground`
   - 作成後、**クライアント ID** と **クライアント シークレット** を環境変数に設定します。

---

## 2. 環境変数の設定

`web/.env.local`（本番は Vercel の Environment Variables）に以下を設定します。

```env
YOUTUBE_CLIENT_ID="..."
YOUTUBE_CLIENT_SECRET="..."
YOUTUBE_TOKEN_ENCRYPTION_KEY="32文字以上のランダム文字列"
```

`YOUTUBE_TOKEN_ENCRYPTION_KEY` は openssl 等で生成できます。

```bash
openssl rand -base64 32
```

---

## 3. リフレッシュトークンの取得

1. [OAuth 2.0 Playground](https://developers.google.com/oauthplayground/) にアクセスします。
2. 右上の **歯車アイコン ⚙️** で `Use your own OAuth credentials` にチェックし、クライアント ID / シークレットを入力します。
3. `Input your own scopes` に以下を入力し、**Authorize APIs** をクリックします。

   ```text
   https://www.googleapis.com/auth/youtube.upload
   ```

4. 動画をアップロードする YouTube チャンネルのアカウントでログインし、権限を許可します。
5. **Exchange authorization code for tokens** をクリックし、**Refresh token** をコピーします。

---

## 4. リフレッシュトークンの保存（暗号化 DB）

### 方法 A: スタッフ画面から保存（推奨）

1. スタッフでログインし、`/staff/settings/youtube` を開きます。
2. 「OAuth 認証情報」セクションに、取得したリフレッシュトークンを貼り付けて **暗号化して保存** をクリックします。

### 方法 B: CLI からインポート（開発用）

`.env.local` に一時的に `YOUTUBE_REFRESH_TOKEN` を設定したうえで:

```bash
cd web
pnpm exec dotenv -e .env.local -- prisma migrate deploy
pnpm youtube:import-token
```

インポート後、`.env.local` から `YOUTUBE_REFRESH_TOKEN` を削除することを推奨します（DB 保存が優先されます）。

---

## 5. トークンのローテーション（失効時）

`invalid_grant` エラーが出た場合:

1. 上記「3. リフレッシュトークンの取得」で新しいトークンを取得します。
2. 「4. リフレッシュトークンの保存」で上書き保存します。
3. 開発サーバーを再起動します。

---

## 6. 本番（Vercel）への反映

1. Vercel の Project Settings > Environment Variables に以下を設定します。
   - `YOUTUBE_CLIENT_ID`
   - `YOUTUBE_CLIENT_SECRET`
   - `YOUTUBE_TOKEN_ENCRYPTION_KEY`（開発と同じ値を使う場合は DB 内トークンを再インポート不要）
2. 本番 DB に対して `prisma migrate deploy` を実行します。
3. 本番のスタッフ画面 `/staff/settings/youtube` からリフレッシュトークンを保存するか、本番用の一時 env で `pnpm youtube:import-token` を実行します。
4. **`YOUTUBE_REFRESH_TOKEN` は本番の環境変数に置かない**（平文回避）。

---

## 7. トラブルシューティング

- **`invalid_grant`**
  - リフレッシュトークン失効。セクション 5 を実施してください。
  - OAuth 同意画面が「テスト中」でないか確認してください。
- **暗号化キー不一致**
  - `YOUTUBE_TOKEN_ENCRYPTION_KEY` を変更すると既存 DB のトークンは復号できません。新しいトークンを再保存してください。
- **Quota exceeded**
  - 1日約 6 本（10,000 クォータ / 1,600 per upload）が目安です。翌日リセットまでお待ちください。
