import { saveYouTubeRefreshToken } from "../src/lib/youtube-credentials";
import { prisma } from "../src/lib/db";

const main = async () => {
  const refreshToken = process.env.YOUTUBE_REFRESH_TOKEN?.trim();
  if (!refreshToken) {
    console.error("YOUTUBE_REFRESH_TOKEN が未設定です。");
    process.exit(1);
  }

  await saveYouTubeRefreshToken(refreshToken);
  console.log("リフレッシュトークンを DB に暗号化保存しました。");
  console.log("本番では .env から YOUTUBE_REFRESH_TOKEN を削除することを推奨します。");
};

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
