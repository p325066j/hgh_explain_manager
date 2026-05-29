import { revalidatePath } from "next/cache";
import { logAudit } from "@/lib/audit";
import { prisma } from "@/lib/db";
import {
  getYouTubeCredentialConfigError,
  getYouTubeCredentialSource,
  isYouTubeTokenEncryptionConfigured,
  saveYouTubeRefreshToken,
} from "@/lib/youtube-credentials";
import RefreshTokenForm from "./refresh-token-form";

async function runVisibilitySync() {
  "use server";
  const targets = await prisma.video.findMany({
    where: { isVisibilityDirty: true, isArchived: false },
    orderBy: { updatedAt: "desc" },
  });

  if (targets.length === 0) {
    return;
  }

  const now = new Date();
  await prisma.$transaction(
    targets.map((video) =>
      prisma.video.update({
        where: { id: video.id },
        data: {
          isVisibilityDirty: false,
          visibilitySyncStatus: "SUCCESS",
          visibilitySyncError: null,
          visibilitySyncedAt: now,
        },
      }),
    ),
  );

  await logAudit({
    action: "SYNC",
    entityType: "VISIBILITY_SYNC",
    entityId: "bulk",
    message: "公開状態を一括反映しました。",
    meta: { count: targets.length, videoIds: targets.map((video) => video.id) },
  });

  revalidatePath("/staff/videos");
  revalidatePath("/staff/settings/youtube");
  revalidatePath("/patient");

  return;
}

async function saveRefreshToken(formData: FormData) {
  "use server";

  const refreshToken = formData.get("refreshToken");
  if (typeof refreshToken !== "string" || !refreshToken.trim()) {
    return { ok: false, message: "リフレッシュトークンを入力してください。" };
  }

  const configError = getYouTubeCredentialConfigError();
  if (configError) {
    return { ok: false, message: configError };
  }

  try {
    await saveYouTubeRefreshToken(refreshToken);
    await logAudit({
      action: "UPDATE",
      entityType: "VISIBILITY_SYNC",
      entityId: "youtube-credential",
      message: "YouTube リフレッシュトークンを更新しました。",
      meta: { storage: "database" },
    });
    revalidatePath("/staff/settings/youtube");
    return {
      ok: true,
      message:
        "リフレッシュトークンを暗号化して保存しました。本番では .env の YOUTUBE_REFRESH_TOKEN 削除を推奨します。",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "保存に失敗しました。";
    return { ok: false, message };
  }
}

const credentialSourceLabel = {
  database: "DB に暗号化保存済み（推奨）",
  environment: "環境変数 YOUTUBE_REFRESH_TOKEN（移行推奨）",
  none: "未設定",
} as const;

export default async function StaffYouTubeSettingsPage() {
  const dirtyVideos = await prisma.video.findMany({
    where: { isVisibilityDirty: true, isArchived: false },
    orderBy: { updatedAt: "desc" },
  });

  const lastSynced = await prisma.video.findFirst({
    where: { visibilitySyncedAt: { not: null } },
    orderBy: { visibilitySyncedAt: "desc" },
  });

  const credentialSource = await getYouTubeCredentialSource();
  const storedCredential = await prisma.youTubeCredential.findUnique({
    where: { id: "default" },
    select: { updatedAt: true },
  });
  const configError = getYouTubeCredentialConfigError();
  const encryptionConfigured = isYouTubeTokenEncryptionConfigured();

  return (
    <div className="grid gap-6">
      <section className="ui-card">
        <h1 className="ui-title">YouTube 連携設定</h1>
        <p className="mt-2 text-sm text-slate-300">
          公開/非公開の変更は一括反映で YouTube に同期されます。
        </p>
      </section>

      <section className="ui-card">
        <h2 className="text-sm font-semibold text-slate-200">OAuth 認証情報</h2>
        <dl className="mt-4 grid gap-3 text-sm text-slate-300">
          <div>
            <dt className="text-slate-400">リフレッシュトークンの保存先</dt>
            <dd className="mt-1 font-medium text-white">
              {credentialSourceLabel[credentialSource]}
            </dd>
          </div>
          <div>
            <dt className="text-slate-400">暗号化キー（YOUTUBE_TOKEN_ENCRYPTION_KEY）</dt>
            <dd className="mt-1">{encryptionConfigured ? "設定済み" : "未設定"}</dd>
          </div>
          {storedCredential?.updatedAt && (
            <div>
              <dt className="text-slate-400">DB 保存の最終更新</dt>
              <dd className="mt-1">
                {storedCredential.updatedAt.toLocaleString("ja-JP", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </dd>
            </div>
          )}
        </dl>
        {configError && (
          <p className="mt-4 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
            {configError}
          </p>
        )}
        <p className="mt-4 text-sm text-slate-400">
          トークン再取得手順は docs/architecture/youtube-api-guide.md を参照してください。
        </p>
        <RefreshTokenForm action={saveRefreshToken} disabled={Boolean(configError)} />
      </section>

      <section className="ui-card">
        <h2 className="text-sm font-semibold text-slate-200">公開状態の一括反映</h2>
        <p className="mt-2 text-sm text-slate-300">
          変更があった動画のみを対象に反映します。反映対象: {dirtyVideos.length} 件
        </p>
        {lastSynced?.visibilitySyncedAt && (
          <p className="mt-2 text-xs text-slate-400">
            最終反映:{" "}
            {lastSynced.visibilitySyncedAt.toLocaleString("ja-JP", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        )}
        <form action={runVisibilitySync} className="mt-4">
          <button type="submit" className="ui-primary-btn">
            一括反映を実行
          </button>
        </form>
      </section>

      <section className="ui-card">
        <h2 className="text-sm font-semibold text-slate-200">反映対象の動画</h2>
        {dirtyVideos.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">反映対象の動画はありません。</p>
        ) : (
          <ul className="mt-4 grid gap-3 text-sm text-slate-200">
            {dirtyVideos.map((video) => (
              <li
                key={video.id}
                className="rounded-2xl border border-slate-800/80 bg-slate-950/60 px-4 py-3"
              >
                <p className="font-semibold text-white">{video.title}</p>
                <p className="text-xs text-slate-400">
                  更新日時:{" "}
                  {video.updatedAt.toLocaleString("ja-JP", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
