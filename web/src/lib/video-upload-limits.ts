/**
 * 動画アップロードの DoS 耐性用制限（SEC-005）。
 * 要件定義: 動画ファイル最大 500MB（docs/architecture/要件定義書.md）
 */

const MB = 1024 * 1024;

const DEFAULT_MAX_BYTES = 500 * MB;
const DEFAULT_UPLOAD_TIMEOUT_MS = 15 * 60 * 1000;

export const ALLOWED_VIDEO_EXTENSIONS = [".mp4", ".mov", ".webm", ".avi", ".mpeg", ".mpg"] as const;

export const ALLOWED_VIDEO_MIME_TYPES = [
  "video/mp4",
  "video/quicktime",
  "video/webm",
  "video/x-msvideo",
  "video/avi",
  "video/mpeg",
  "video/mpg",
] as const;

const EXTENSION_SET = new Set<string>(ALLOWED_VIDEO_EXTENSIONS);
const MIME_SET = new Set<string>(ALLOWED_VIDEO_MIME_TYPES);

export type VideoUploadValidationResult =
  | { ok: true; contentType: string }
  | { ok: false; message: string; fieldErrors?: { file: string[] } };

export const getVideoUploadMaxBytes = () => {
  const raw = process.env.VIDEO_UPLOAD_MAX_BYTES;
  if (!raw) return DEFAULT_MAX_BYTES;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return DEFAULT_MAX_BYTES;
  return parsed;
};

export const getVideoUploadTimeoutMs = () => {
  const raw = process.env.VIDEO_UPLOAD_TIMEOUT_MS;
  if (!raw) return DEFAULT_UPLOAD_TIMEOUT_MS;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed < 30_000) return DEFAULT_UPLOAD_TIMEOUT_MS;
  return parsed;
};

export const formatMaxUploadSizeLabel = () => {
  const maxMb = Math.floor(getVideoUploadMaxBytes() / MB);
  return `${maxMb}MB`;
};

const getExtension = (fileName: string) => {
  const dot = fileName.lastIndexOf(".");
  if (dot < 0) return "";
  return fileName.slice(dot).toLowerCase();
};

const hasAllowedExtension = (fileName: string) => EXTENSION_SET.has(getExtension(fileName));

const hasAllowedMime = (mimeType: string) => {
  const normalized = mimeType.split(";")[0]?.trim().toLowerCase() ?? "";
  if (!normalized) return false;
  return MIME_SET.has(normalized);
};

const readFileHead = async (file: File, length = 12) => {
  const slice = file.slice(0, length);
  return new Uint8Array(await slice.arrayBuffer());
};

/** 先頭バイトからコンテナ形式をざっくり判定（拡張子偽装の抑止） */
export const detectVideoContainerFromHead = (head: Uint8Array): string | null => {
  if (head.length < 4) return null;

  const ascii = (start: number, len: number) =>
    String.fromCharCode(...head.subarray(start, start + len));

  if (head.length >= 8 && ascii(4, 4) === "ftyp") {
    return "iso"; // MP4 / MOV など
  }
  if (head[0] === 0x1a && head[1] === 0x45 && head[2] === 0xdf && head[3] === 0xa3) {
    return "webm";
  }
  if (ascii(0, 4) === "RIFF" && head.length >= 12 && ascii(8, 4) === "AVI ") {
    return "avi";
  }
  if (
    (head[0] === 0x00 && head[1] === 0x00 && head[2] === 0x01 && head[3] === 0xb3) ||
    (head[0] === 0x00 && head[1] === 0x00 && head[2] === 0x01 && head[3] === 0xba)
  ) {
    return "mpeg";
  }

  return null;
};

const resolveContentType = (file: File, container: string | null) => {
  const mime = file.type.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mime && MIME_SET.has(mime)) return mime;

  const ext = getExtension(file.name);
  const byExt: Record<string, string> = {
    ".mp4": "video/mp4",
    ".mov": "video/quicktime",
    ".webm": "video/webm",
    ".avi": "video/x-msvideo",
    ".mpeg": "video/mpeg",
    ".mpg": "video/mpeg",
  };
  if (ext && byExt[ext]) return byExt[ext];

  if (container === "webm") return "video/webm";
  if (container === "iso") return "video/mp4";
  if (container === "avi") return "video/x-msvideo";
  if (container === "mpeg") return "video/mpeg";

  return "video/mp4";
};

export const validateVideoUploadFile = async (file: File): Promise<VideoUploadValidationResult> => {
  if (!(file instanceof File) || file.size === 0) {
    return {
      ok: false,
      message: "動画ファイルを選択してください。",
      fieldErrors: { file: ["動画ファイルを選択してください。"] },
    };
  }

  const maxBytes = getVideoUploadMaxBytes();
  if (file.size > maxBytes) {
    return {
      ok: false,
      message: `動画ファイルは ${formatMaxUploadSizeLabel()} 以下にしてください。`,
      fieldErrors: {
        file: [`ファイルサイズが上限（${formatMaxUploadSizeLabel()}）を超えています。`],
      },
    };
  }

  if (!hasAllowedExtension(file.name)) {
    return {
      ok: false,
      message: "対応していないファイル形式です。",
      fieldErrors: {
        file: [`対応形式: ${ALLOWED_VIDEO_EXTENSIONS.join(", ")}`],
      },
    };
  }

  const mime = file.type.split(";")[0]?.trim().toLowerCase() ?? "";
  if (mime && !hasAllowedMime(mime)) {
    return {
      ok: false,
      message: "対応していない動画形式です。",
      fieldErrors: { file: ["MP4 / MOV / WebM / AVI / MPEG を選択してください。"] },
    };
  }

  const head = await readFileHead(file);
  const container = detectVideoContainerFromHead(head);
  if (!container) {
    return {
      ok: false,
      message: "動画ファイルの内容を確認できませんでした。",
      fieldErrors: { file: ["有効な動画ファイルか確認してください。"] },
    };
  }

  const ext = getExtension(file.name);
  if (container === "webm" && ext !== ".webm") {
    return {
      ok: false,
      message: "ファイル名と内容が一致しません。",
      fieldErrors: { file: ["WebM 形式の場合は .webm 拡張子を使用してください。"] },
    };
  }
  if (container === "iso" && ext !== ".mp4" && ext !== ".mov") {
    return {
      ok: false,
      message: "ファイル名と内容が一致しません。",
      fieldErrors: { file: ["MP4 / MOV 形式として認識されました。拡張子を確認してください。"] },
    };
  }

  return { ok: true, contentType: resolveContentType(file, container) };
};
