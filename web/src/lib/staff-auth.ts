import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export const STAFF_AUTH_COOKIE = "staff_auth";

const SESSION_VERSION = 1;
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const encoder = new TextEncoder();

type StaffSessionPayload = {
  v: typeof SESSION_VERSION;
  exp: number;
};

type StaffSessionCookieOptions = {
  httpOnly: true;
  sameSite: "lax";
  secure: boolean;
  path: "/";
  maxAge: number;
};

const bytesToBase64Url = (bytes: Uint8Array) => {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/u, "");
};

const base64UrlToBytes = (value: string) => {
  const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(
    Math.ceil(value.length / 4) * 4,
    "=",
  );
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
};

const encodePayload = (payload: StaffSessionPayload) =>
  bytesToBase64Url(encoder.encode(JSON.stringify(payload)));

const decodePayload = (value: string): StaffSessionPayload | null => {
  try {
    const json = new TextDecoder().decode(base64UrlToBytes(value));
    const parsed = JSON.parse(json) as Partial<StaffSessionPayload>;
    if (parsed.v !== SESSION_VERSION || typeof parsed.exp !== "number") {
      return null;
    }
    return { v: parsed.v, exp: parsed.exp };
  } catch {
    return null;
  }
};

const getSessionSecret = () => {
  const secret = process.env.STAFF_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
};

const importSigningKey = async (secret: string) =>
  crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );

const sign = async (payload: string, secret: string) => {
  const key = await importSigningKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return new Uint8Array(signature);
};

const timingSafeEqual = (a: Uint8Array, b: Uint8Array) => {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a[index] ^ b[index];
  }
  return diff === 0;
};

export const createStaffSessionCookieValue = async (now = Date.now()) => {
  const secret = getSessionSecret();
  if (!secret) {
    throw new Error("STAFF_SESSION_SECRET must be at least 32 characters.");
  }

  const payload = encodePayload({
    v: SESSION_VERSION,
    exp: now + SESSION_TTL_SECONDS * 1000,
  });
  const signature = await sign(payload, secret);
  return `${payload}.${bytesToBase64Url(signature)}`;
};

export const isStaffAuthCookieValue = async (value: string | undefined, now = Date.now()) => {
  const secret = getSessionSecret();
  if (!value || !secret) return false;

  const [payload, encodedSignature, extra] = value.split(".");
  if (!payload || !encodedSignature || extra !== undefined) return false;

  const decoded = decodePayload(payload);
  if (!decoded || decoded.exp <= now) return false;

  try {
    const expected = await sign(payload, secret);
    const actual = base64UrlToBytes(encodedSignature);
    return timingSafeEqual(expected, actual);
  } catch {
    return false;
  }
};

export const isStaffAuthenticated = async (req: NextRequest) =>
  isStaffAuthCookieValue(req.cookies.get(STAFF_AUTH_COOKIE)?.value);

export const staffSessionCookieOptions = (): StaffSessionCookieOptions => ({
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_TTL_SECONDS,
});

export const staffUnauthorizedResponse = () =>
  NextResponse.json({ message: "unauthorized" }, { status: 401 });

export const requireStaffApiAuth = async (req: NextRequest) =>
  (await isStaffAuthenticated(req)) ? null : staffUnauthorizedResponse();
