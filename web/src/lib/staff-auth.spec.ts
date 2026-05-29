import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  createStaffSessionCookieValue,
  isStaffAuthCookieValue,
} from "./staff-auth";

const ORIGINAL_SECRET = process.env.STAFF_SESSION_SECRET;
const VALID_SECRET = "test-session-secret-with-at-least-32-chars";

describe("staff auth", () => {
  beforeEach(() => {
    process.env.STAFF_SESSION_SECRET = VALID_SECRET;
  });

  afterEach(() => {
    process.env.STAFF_SESSION_SECRET = ORIGINAL_SECRET;
  });

  it("accepts a signed and unexpired session cookie", async () => {
    const now = Date.UTC(2026, 3, 15);
    const cookie = await createStaffSessionCookieValue(now);

    await expect(isStaffAuthCookieValue(cookie, now + 1000)).resolves.toBe(true);
  });

  it("rejects legacy flag cookies and tampered cookies", async () => {
    const now = Date.UTC(2026, 3, 15);
    const cookie = await createStaffSessionCookieValue(now);

    await expect(isStaffAuthCookieValue("1", now)).resolves.toBe(false);
    await expect(isStaffAuthCookieValue(`${cookie}x`, now)).resolves.toBe(false);
  });

  it("rejects expired session cookies", async () => {
    const now = Date.UTC(2026, 3, 15);
    const cookie = await createStaffSessionCookieValue(now);

    await expect(isStaffAuthCookieValue(cookie, now + 9 * 60 * 60 * 1000)).resolves.toBe(false);
  });

  it("requires a dedicated session secret", async () => {
    process.env.STAFF_SESSION_SECRET = "short";

    await expect(createStaffSessionCookieValue()).rejects.toThrow("STAFF_SESSION_SECRET");
    await expect(isStaffAuthCookieValue("1")).resolves.toBe(false);
  });
});
