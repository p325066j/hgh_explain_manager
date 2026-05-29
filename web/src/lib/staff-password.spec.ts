import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  getStaffPasswordConfigError,
  isStaffPasswordConfigured,
  verifyStaffPassword,
} from "./staff-password";

const ORIGINAL_LOGIN_PASSWORD = process.env.STAFF_LOGIN_PASSWORD;
const ORIGINAL_PASSCODE = process.env.STAFF_PASSCODE;

describe("staff password", () => {
  beforeEach(() => {
    delete process.env.STAFF_LOGIN_PASSWORD;
    delete process.env.STAFF_PASSCODE;
  });

  afterEach(() => {
    process.env.STAFF_LOGIN_PASSWORD = ORIGINAL_LOGIN_PASSWORD;
    process.env.STAFF_PASSCODE = ORIGINAL_PASSCODE;
  });

  it("accepts the configured staff login password", () => {
    process.env.STAFF_LOGIN_PASSWORD = "StrongPass123";

    expect(isStaffPasswordConfigured()).toBe(true);
    expect(verifyStaffPassword("StrongPass123")).toBe(true);
    expect(verifyStaffPassword("wrong-password")).toBe(false);
  });

  it("falls back to legacy STAFF_PASSCODE", () => {
    process.env.STAFF_PASSCODE = "LegacyPass123";

    expect(isStaffPasswordConfigured()).toBe(true);
    expect(verifyStaffPassword("LegacyPass123")).toBe(true);
  });

  it("rejects too-short configuration values", () => {
    process.env.STAFF_LOGIN_PASSWORD = "short";

    expect(isStaffPasswordConfigured()).toBe(false);
    expect(verifyStaffPassword("short")).toBe(false);
    expect(getStaffPasswordConfigError()).toContain("STAFF_LOGIN_PASSWORD");
  });
});
