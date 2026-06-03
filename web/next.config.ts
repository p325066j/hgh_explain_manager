import type { NextConfig } from "next";
import path from "node:path";

const MB = 1024 * 1024;
const defaultMaxBytes = 500 * MB;
const configuredMax = Number.parseInt(process.env.VIDEO_UPLOAD_MAX_BYTES ?? "", 10);
const maxBytes =
  Number.isFinite(configuredMax) && configuredMax > 0 ? configuredMax : defaultMaxBytes;
// フォームメタデータ分の余裕を含め、要件上限に合わせて Server Actions の受信上限を設定（SEC-005）
const bodySizeLimitMb = Math.ceil(maxBytes / MB) + 20;

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname, ".."),
  experimental: {
    serverActions: {
      bodySizeLimit: `${bodySizeLimitMb}mb`,
    },
  },
};

export default nextConfig;
