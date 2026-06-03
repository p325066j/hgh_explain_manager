import { Prisma } from "@prisma/client";
import {
  getVideoUploadTimeoutMs,
  validateVideoUploadFile,
} from "@/lib/video-upload-limits";
import { getYouTubeOAuthCredentials } from "@/lib/youtube-credentials";

const refreshYouTubeAccessToken = async () => {
  const { clientId, clientSecret, refreshToken } = await getYouTubeOAuthCredentials();

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
    if (text.includes("invalid_grant")) {
      throw new Error(
        "YouTube のリフレッシュトークンが失効しています。スタッフ設定 > YouTube 連携から再設定するか、docs/architecture/youtube-api-guide.md の手順に従って再認証してください。" +
          "（同意画面が『テスト』公開のままだとトークンは 7 日で失効します）",
      );
    }
    throw new Error(`アクセストークンの更新に失敗しました: ${text}`);
  }

  const data = (await response.json()) as { access_token?: string };
  return data.access_token ?? null;
};

export const getYouTubeAccessToken = async () => {
  const refreshed = await refreshYouTubeAccessToken();
  if (refreshed) {
    return refreshed;
  }

  const accessToken = process.env.YOUTUBE_ACCESS_TOKEN?.trim();
  if (!accessToken) {
    throw new Error("YouTube 連携が未設定です。設定完了後に再度お試しください。");
  }
  return accessToken;
};

type UploadInput = {
  file: File;
  contentType: string;
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
  const fileCheck = await validateVideoUploadFile(input.file);
  if (!fileCheck.ok) {
    throw new Error(fileCheck.message);
  }

  const contentType = input.contentType || fileCheck.contentType;
  const accessToken = await getYouTubeAccessToken();
  const uploadTimeoutMs = getVideoUploadTimeoutMs();

  const metadataResponse = await fetch(
    "https://www.googleapis.com/upload/youtube/v3/videos?uploadType=resumable&part=snippet,status",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json; charset=UTF-8",
        "X-Upload-Content-Length": input.file.size.toString(),
        "X-Upload-Content-Type": contentType,
      },
      body: JSON.stringify(buildMetadata(input)),
      signal: AbortSignal.timeout(uploadTimeoutMs),
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

  let videoResponse: Response;
  try {
    videoResponse = await fetch(uploadUrl, {
      method: "PUT",
      headers: {
        "Content-Length": input.file.size.toString(),
        "Content-Type": contentType,
      },
      // 一括メモリ展開を避け、ReadableStream で YouTube へ送信する
      body: input.file.stream(),
      duplex: "half",
      signal: AbortSignal.timeout(uploadTimeoutMs),
    } as RequestInit);
  } catch (error) {
    if (error instanceof Error && error.name === "TimeoutError") {
      throw new Error(
        `YouTube アップロードがタイムアウトしました（${Math.floor(uploadTimeoutMs / 60_000)} 分以内）。ファイルサイズを小さくするか、時間をおいて再試行してください。`,
      );
    }
    throw error;
  }

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
