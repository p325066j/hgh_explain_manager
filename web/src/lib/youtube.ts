import { Prisma } from "@prisma/client";

const getAccessTokenFromRefreshToken = async () => {
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN;
  const clientId = process.env.YOUTUBE_CLIENT_ID;
  const clientSecret = process.env.YOUTUBE_CLIENT_SECRET;

  if (!refreshToken || !clientId || !clientSecret) {
    return null;
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    refresh_token: refreshToken,
    grant_type: "refresh_token",
  });

  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`アクセストークンの更新に失敗しました: ${text}`);
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
};

export const getYouTubeAccessToken = async () => {
  const refreshed = await getAccessTokenFromRefreshToken();
  if (refreshed) return refreshed;

  const accessToken = process.env.YOUTUBE_ACCESS_TOKEN;
  if (!accessToken) {
    throw new Error("YouTube 連携が未設定です。設定完了後に再度お試しください。");
  }
  return accessToken;
};

type UploadInput = {
  file: File;
  title: string;
  description: string;
  youtubeCategoryId?: string;
  privacyStatus: "public" | "unlisted" | "private";
};

type UploadResponse = {
  id?: string;
  snippet?: {
    title?: string;
    description?: string;
    categoryId?: string;
    thumbnails?: {
      default?: { url?: string };
      medium?: { url?: string };
      high?: { url?: string };
    };
  };
};

const buildMetadata = (input: UploadInput) => {
  const snippet: Record<string, string> = {
    title: input.title,
    description: input.description,
  };

  if (input.youtubeCategoryId) {
    snippet.categoryId = input.youtubeCategoryId;
  }

  return {
    snippet,
    status: {
      privacyStatus: input.privacyStatus,
    },
  };
};

export const uploadYouTubeVideo = async (input: UploadInput) => {
  const accessToken = await getYouTubeAccessToken();

  const metadataResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": input.file.size.toString(),
        "X-Upload-Content-Type": input.file.type || "video/*",
      },
      body: JSON.stringify(buildMetadata(input)),
    },
  );

  if (!metadataResponse.ok) {
    const text = await metadataResponse.text();
    throw new Error(`YouTube メタ情報登録に失敗しました: ${text}`);
  }

  const uploadUrl = metadataResponse.headers.get("Location");
  if (!uploadUrl) {
    throw new Error("アップロード URL を取得できませんでした。");
  }

  const videoResponse = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Length": input.file.size.toString(),
      "Content-Type": input.file.type || "video/*",
    },
    body: Buffer.from(await input.file.arrayBuffer()),
  });

  if (!videoResponse.ok) {
    const text = await videoResponse.text();
    throw new Error(`YouTube アップロードに失敗しました: ${text}`);
  }

  const data = (await videoResponse.json()) as UploadResponse;
  return data;
};

export const buildYouTubeUrl = (videoId: string) =>
  `https://www.youtube.com/watch?v=${videoId}`;

export const toPrismaJson = (value: unknown): Prisma.InputJsonValue =>
  value as Prisma.InputJsonValue;