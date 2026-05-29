import { describe, expect, it } from "vitest";
import { decryptSecret, encryptSecret } from "./crypto-secrets";

describe("crypto-secrets", () => {
  const key = "test-encryption-key-with-32-chars-min";

  it("round-trips plaintext", () => {
    const plaintext = "1//04example-refresh-token-value";
    const encrypted = encryptSecret(plaintext, key);
    expect(encrypted).not.toContain(plaintext);
    expect(decryptSecret(encrypted, key)).toBe(plaintext);
  });

  it("fails decryption with a different key", () => {
    const encrypted = encryptSecret("secret-token", key);
    expect(() => decryptSecret(encrypted, "another-key-with-32-chars-min!!")).toThrow();
  });
});
