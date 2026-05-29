import { describe, expect, it } from "vitest";
import { buildStaffApiRateLimitScope } from "./staff-api-rate-limit";

describe("staff api rate limit", () => {
  it("builds a stable scope from method and pathname", () => {
    const request = {
      method: "POST",
      nextUrl: { pathname: "/api/videos" },
    } as Parameters<typeof buildStaffApiRateLimitScope>[0];

    expect(buildStaffApiRateLimitScope(request)).toBe("POST:/api/videos");
  });
});
