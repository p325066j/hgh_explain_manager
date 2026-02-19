import { PrismaClient } from "@prisma/client";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getCategories, getVideos } from "../src/lib/mock-data";

const ENV_FILE = ".env.local";

const loadEnv = () => {
  const envPath = resolve(process.cwd(), ENV_FILE);
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIndex = trimmed.indexOf("=");
    if (eqIndex === -1) continue;
    const key = trimmed.slice(0, eqIndex).trim();
    const raw = trimmed.slice(eqIndex + 1).trim();
    const value = raw.replace(/^"|"$/g, "");
    process.env[key] ??= value;
  }
};

const ensureAbsoluteDatabaseUrl = () => {
  const current = process.env.DATABASE_URL;
  if (!current || !current.startsWith("file:")) return;
  const filePath = current.slice("file:".length);
  const absolute = resolve(process.cwd(), filePath);
  const normalized = `file:${absolute.replace(/\\/g, "/")}`;
  process.env.DATABASE_URL = normalized;
};

loadEnv();
ensureAbsoluteDatabaseUrl();

const prisma = new PrismaClient();

const normalizeDate = (value: string) => new Date(value);

async function main() {
  console.log("[seed] delete existing data...");
  await prisma.videoCategory.deleteMany();
  await prisma.video.deleteMany();
  await prisma.category.deleteMany();

  const categories = getCategories();
  console.log(`[seed] insert categories (${categories.length})`);

  await prisma.category.createMany({
    data: categories.map((category) => ({
      id: category.id,
      name: category.name,
      slug: category.slug,
      order: category.order,
      createdAt: normalizeDate(category.createdAt),
      updatedAt: normalizeDate(category.updatedAt),
    })),
  });

  const videos = getVideos();
  console.log(`[seed] insert videos (${videos.length})`);

  await prisma.video.createMany({
    data: videos.map((video) => ({
      id: video.id,
      title: video.title,
      description: video.description,
      procedures: video.procedures.join(", "),
      duration: video.duration,
      fileUrl: video.fileUrl,
      thumbnailUrl: video.thumbnailUrl,
      isVisible: video.isVisible,
      isArchived: video.isArchived,
      isVisibilityDirty: false,
      visibilitySyncStatus: "SUCCESS",
      visibilitySyncedAt: normalizeDate(video.updatedAt),
      visibilitySyncError: null,
      createdAt: normalizeDate(video.createdAt),
      updatedAt: normalizeDate(video.updatedAt),
    })),
  });

  await prisma.videoCategory.createMany({
    data: videos.flatMap((video) =>
      video.categoryIds.map((categoryId) => ({
        videoId: video.id,
        categoryId,
        order: 0,
      })),
    ),
  });

  const [categoryCount, videoCount] = await Promise.all([
    prisma.category.count(),
    prisma.video.count(),
  ]);
  console.log(`[seed] completed categories=${categoryCount} videos=${videoCount}`);
}

main()
  .catch((error) => {
    console.error("[seed] failed", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
