import { prisma } from "./db";

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000;
const BLOCK_MS = 15 * 60 * 1000;
const STAFF_LOGIN_PREFIX = "staff-login";

type LoginRateLimitStatus = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

type StaffLoginRateLimitRecord = {
  key: string;
  failedCount: number;
  firstFailedAt: Date;
  blockedUntil: Date | null;
};

type StaffLoginRateLimitDelegate = {
  findUnique: (args: { where: { key: string } }) => Promise<StaffLoginRateLimitRecord | null>;
  delete: (args: { where: { key: string } }) => Promise<unknown>;
  upsert: (args: {
    where: { key: string };
    create: {
      key: string;
      failedCount: number;
      firstFailedAt: Date;
      blockedUntil: Date | null;
    };
    update: {
      failedCount: number;
      firstFailedAt: Date;
      blockedUntil: Date | null;
    };
  }) => Promise<unknown>;
  update: (args: {
    where: { key: string };
    data: {
      failedCount: number;
      blockedUntil: Date | null;
    };
  }) => Promise<unknown>;
};

const buildKey = (identifier: string) => `${STAFF_LOGIN_PREFIX}:${identifier}`;

const getRateLimitDelegate = () =>
  (prisma as typeof prisma & { staffLoginRateLimit?: StaffLoginRateLimitDelegate }).staffLoginRateLimit;

const isRateLimitUnavailableError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("staffLoginRateLimit") ||
    error.message.includes("does not exist") ||
    error.message.includes("Cannot read properties of undefined")
  );
};

const runWithRateLimitFallback = async <T>(callback: (delegate: StaffLoginRateLimitDelegate) => Promise<T>) => {
  const delegate = getRateLimitDelegate();
  if (!delegate) {
    return null;
  }

  try {
    return await callback(delegate);
  } catch (error) {
    if (isRateLimitUnavailableError(error)) {
      return null;
    }
    throw error;
  }
};

const getIdentifier = (value: string | null) => {
  const candidate = value?.split(",")[0]?.trim();
  return candidate && candidate.length > 0 ? candidate : "unknown";
};

export const getClientIpFromHeaders = (headers: Headers) =>
  getIdentifier(headers.get("x-forwarded-for") ?? headers.get("x-real-ip"));

export const checkStaffLoginRateLimit = async (
  identifier: string,
  now = new Date(),
): Promise<LoginRateLimitStatus> => {
  const record = await runWithRateLimitFallback((delegate) =>
    delegate.findUnique({
      where: { key: buildKey(identifier) },
    }),
  );

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000)),
    };
  }

  if (now.getTime() - record.firstFailedAt.getTime() > WINDOW_MS) {
    await runWithRateLimitFallback((delegate) => delegate.delete({ where: { key: record.key } }));
    return { allowed: true };
  }

  return { allowed: true };
};

export const recordStaffLoginFailure = async (identifier: string, now = new Date()) => {
  const key = buildKey(identifier);
  const record = await runWithRateLimitFallback((delegate) => delegate.findUnique({ where: { key } }));

  if (!record || now.getTime() - record.firstFailedAt.getTime() > WINDOW_MS) {
    await runWithRateLimitFallback((delegate) =>
      delegate.upsert({
        where: { key },
        create: {
          key,
          failedCount: 1,
          firstFailedAt: now,
          blockedUntil: null,
        },
        update: {
          failedCount: 1,
          firstFailedAt: now,
          blockedUntil: null,
        },
      }),
    );
    return;
  }

  const nextFailedCount = record.failedCount + 1;
  await runWithRateLimitFallback((delegate) =>
    delegate.update({
      where: { key },
      data: {
        failedCount: nextFailedCount,
        blockedUntil: nextFailedCount >= MAX_FAILURES ? new Date(now.getTime() + BLOCK_MS) : null,
      },
    }),
  );
};

export const clearStaffLoginFailures = async (identifier: string) => {
  await runWithRateLimitFallback((delegate) =>
    delegate.delete({ where: { key: buildKey(identifier) } }),
  );
};
