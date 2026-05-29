import { decryptSecret, encryptSecret } from "@/lib/crypto-secrets";
import { prisma } from "@/lib/db";

const CREDENTIAL_ID = "default";
const MIN_ENCRYPTION_KEY_LENGTH = 32;

export type YouTubeOAuthCredentials = {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
};

export type YouTubeCredentialSource = "database" | "environment" | "none";

const getEncryptionKey = () => {
  const key = process.env.YOUTUBE_TOKEN_ENCRYPTION_KEY;
  if (!key || key.length < MIN_ENCRYPTION_KEY_LENGTH) {
    return null;
  }
  return key;
};

const getClientCredentials = () => {
  const clientId = process.env.YOUTUBE_CLIENT_ID?.trim();
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return null;
  }
  return { clientId, clientSecret };
};

const readRefreshTokenFromDatabase = async (): Promise<string | null> => {
  const encryptionKey = getEncryptionKey();
  if (!encryptionKey) {
    return null;
  }

  const record = await prisma.youTubeCredential.findUnique({
    where: { id: CREDENTIAL_ID },
    select: { refreshTokenEncrypted: true },
  });

  if (!record?.refreshTokenEncrypted) {
    return null;
  }

  try {
    return decryptSecret(record.refreshTokenEncrypted, encryptionKey);
  } catch {
    throw new Error(
      "YouTube リフレッシュトークンの復号に失敗しました。YOUTUBE_TOKEN_ENCRYPTION_KEY が正しいか確認してください。",
    );
  }
};

const readRefreshTokenFromEnvironment = () => {
  const token = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
  return token || null;
};

export const getYouTubeCredentialSource = async (): Promise<YouTubeCredentialSource> => {
  const fromDatabase = await readRefreshTokenFromDatabase();
  if (fromDatabase) {
    return "database";
  }
  if (readRefreshTokenFromEnvironment()) {
    return "environment";
  }
  return "none";
};

export const isYouTubeTokenEncryptionConfigured = () => Boolean(getEncryptionKey());

export const isYouTubeOAuthConfigured = async () => {
  const clients = getClientCredentials();
  if (!clients) {
    return false;
  }
  const source = await getYouTubeCredentialSource();
  return source !== "none";
};

export const getYouTubeOAuthCredentials = async (): Promise<YouTubeOAuthCredentials> => {
  const clients = getClientCredentials();
  if (!clients) {
    throw new Error(
      "YouTube OAuth のクライアント ID / シークレットが未設定です。YOUTUBE_CLIENT_ID と YOUTUBE_CLIENT_SECRET を設定してください。",
    );
  }

  const refreshToken =
    (await readRefreshTokenFromDatabase()) ?? readRefreshTokenFromEnvironment();

  if (!refreshToken) {
    throw new Error(
      "YouTube のリフレッシュトークンが未設定です。スタッフ設定の YouTube 連携から保存するか、docs/architecture/youtube-api-guide.md の手順に従って設定してください。",
    );
  }

  return {
    clientId: clients.clientId,
    clientSecret: clients.clientSecret,
    refreshToken,
  };
};

export const saveYouTubeRefreshToken = async (refreshToken: string) => {
  const normalized = refreshToken.trim();
  if (!normalized) {
    throw new Error("リフレッシュトークンが空です。");
  }

  const encryptionKey = getEncryptionKey();
  if (!encryptionKey) {
    throw new Error(
      `YOUTUBE_TOKEN_ENCRYPTION_KEY が未設定または短すぎます（${MIN_ENCRYPTION_KEY_LENGTH} 文字以上が必要です）。`,
    );
  }

  const clients = getClientCredentials();
  if (!clients) {
    throw new Error("YouTube OAuth のクライアント ID / シークレットを先に設定してください。");
  }

  const refreshTokenEncrypted = encryptSecret(normalized, encryptionKey);
  await prisma.youTubeCredential.upsert({
    where: { id: CREDENTIAL_ID },
    create: { id: CREDENTIAL_ID, refreshTokenEncrypted },
    update: { refreshTokenEncrypted },
  });
};

export const getYouTubeCredentialConfigError = () => {
  if (!getClientCredentials()) {
    return "YOUTUBE_CLIENT_ID と YOUTUBE_CLIENT_SECRET を設定してください。";
  }
  if (!isYouTubeTokenEncryptionConfigured()) {
    return `YOUTUBE_TOKEN_ENCRYPTION_KEY を ${MIN_ENCRYPTION_KEY_LENGTH} 文字以上で設定してください。`;
  }
  return null;
};
