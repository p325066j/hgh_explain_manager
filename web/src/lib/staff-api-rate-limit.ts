import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { prisma } from "./db";
import { getClientIpFromHeaders } from "./staff-login-rate-limit";

const STAFF_API_PREFIX = "staff-api";
const DEFAULT_WINDOW_MS = 60 * 1000;
const DEFAULT_MAX_REQUESTS = 60;
const DEFAULT_BLOCK_MS = 5 * 60 * 1000;

type StaffApiRateLimitRecord = {
  key: string;
  requestCount: number;
  windowStartedAt: Date;
  blockedUntil: Date | null;
};

type StaffApiRateLimitDelegate = {
  findUnique: (args: { where: { key: string } }) => Promise<StaffApiRateLimitRecord | null>;
  delete: (args: { where: { key: string } }) => Promise<unknown>;
  upsert: (args: {
    where: { key: string };
    create: {
      key: string;
      requestCount: number;
      windowStartedAt: Date;
      blockedUntil: Date | null;
    };
    update: {
      requestCount: number;
      windowStartedAt: Date;
      blockedUntil: Date | null;
    };
  }) => Promise<unknown>;
  update: (args: {
    where: { key: string };
    data: {
      requestCount: number;
      blockedUntil: Date | null;
      windowStartedAt?: Date;
    };
  }) => Promise<unknown>;
};

type RateLimitOptions = {
  blockMs?: number;
  maxRequests?: number;
  windowMs?: number;
};

type RateLimitStatus = {
  allowed: boolean;
  retryAfterSeconds?: number;
};

const getApiRateLimitDelegate = () =>
  (prisma as typeof prisma & { staffApiRateLimit?: StaffApiRateLimitDelegate }).staffApiRateLimit;

const isUnavailableError = (error: unknown) => {
  if (!(error instanceof Error)) return false;
  return (
    error.message.includes("staffApiRateLimit") ||
    error.message.includes("does not exist") ||
    error.message.includes("Cannot read properties of undefined")
  );
};

const runWithFallback = async <T>(callback: (delegate: StaffApiRateLimitDelegate) => Promise<T>) => {
  const delegate = getApiRateLimitDelegate();
  if (!delegate) return null;

  try {
    return await callback(delegate);
  } catch (error) {
    if (isUnavailableError(error)) {
      return null;
    }
    throw error;
  }
};

const buildKey = (identifier: string, scope: string) => `${STAFF_API_PREFIX}:${scope}:${identifier}`;

export const buildStaffApiRateLimitScope = (req: NextRequest) =>
  `${req.method}:${req.nextUrl.pathname}`;

const getRateLimitConfig = (options?: RateLimitOptions) => ({
  blockMs: options?.blockMs ?? DEFAULT_BLOCK_MS,
  maxRequests: options?.maxRequests ?? DEFAULT_MAX_REQUESTS,
  windowMs: options?.windowMs ?? DEFAULT_WINDOW_MS,
});

const createTooManyRequestsResponse = (retryAfterSeconds: number) => {
  const response = NextResponse.json(
    {
      message: `rate limit exceeded; retry after ${retryAfterSeconds} seconds`,
    },
    { status: 429 },
  );
  response.headers.set("Retry-After", retryAfterSeconds.toString());
  return response;
};

export const checkStaffApiRateLimit = async (
  identifier: string,
  scope: string,
  options?: RateLimitOptions,
  now = new Date(),
): Promise<RateLimitStatus> => {
  const { windowMs } = getRateLimitConfig(options);
  const key = buildKey(identifier, scope);
  const record = await runWithFallback((delegate) => delegate.findUnique({ where: { key } }));

  if (!record) {
    return { allowed: true };
  }

  if (record.blockedUntil && record.blockedUntil > now) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((record.blockedUntil.getTime() - now.getTime()) / 1000)),
    };
  }

  if (now.getTime() - record.windowStartedAt.getTime() > windowMs) {
    await runWithFallback((delegate) => delegate.delete({ where: { key } }));
    return { allowed: true };
  }

  return { allowed: true };
};

export const recordStaffApiRequest = async (
  identifier: string,
  scope: string,
  options?: RateLimitOptions,
  now = new Date(),
) => {
  const { blockMs, maxRequests, windowMs } = getRateLimitConfig(options);
  const key = buildKey(identifier, scope);
  const record = await runWithFallback((delegate) => delegate.findUnique({ where: { key } }));

  if (!record || now.getTime() - record.windowStartedAt.getTime() > windowMs) {
    await runWithFallback((delegate) =>
      delegate.upsert({
        where: { key },
        create: {
          key,
          requestCount: 1,
          windowStartedAt: now,
          blockedUntil: null,
        },
        update: {
          requestCount: 1,
          windowStartedAt: now,
          blockedUntil: null,
        },
      }),
    );
    return;
  }

  const nextRequestCount = record.requestCount + 1;
  await runWithFallback((delegate) =>
    delegate.update({
      where: { key },
      data: {
        requestCount: nextRequestCount,
        windowStartedAt: record.windowStartedAt,
        blockedUntil: nextRequestCount > maxRequests ? new Date(now.getTime() + blockMs) : null,
      },
    }),
  );
};

export const requireStaffApiRateLimit = async (
  req: NextRequest,
  options?: RateLimitOptions,
) => {
  const identifier = getClientIpFromHeaders(req.headers);
  const scope = buildStaffApiRateLimitScope(req);
  const status = await checkStaffApiRateLimit(identifier, scope, options);
  if (!status.allowed) {
    return createTooManyRequestsResponse(status.retryAfterSeconds ?? 60);
  }

  await recordStaffApiRequest(identifier, scope, options);
  return null;
};
