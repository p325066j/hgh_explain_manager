import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const TAG_LENGTH = 16;
const KEY_LENGTH = 32;

const deriveKey = (encryptionKey: string, salt: Buffer) =>
  scryptSync(encryptionKey, salt, KEY_LENGTH);

export const encryptSecret = (plaintext: string, encryptionKey: string): string => {
  const salt = randomBytes(SALT_LENGTH);
  const key = deriveKey(encryptionKey, salt);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([salt, iv, tag, encrypted]).toString("base64");
};

export const decryptSecret = (ciphertext: string, encryptionKey: string): string => {
  const buffer = Buffer.from(ciphertext, "base64");
  if (buffer.length < SALT_LENGTH + IV_LENGTH + TAG_LENGTH + 1) {
    throw new Error("暗号化データの形式が不正です。");
  }

  const salt = buffer.subarray(0, SALT_LENGTH);
  const iv = buffer.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH);
  const tag = buffer.subarray(SALT_LENGTH + IV_LENGTH, SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const encrypted = buffer.subarray(SALT_LENGTH + IV_LENGTH + TAG_LENGTH);
  const key = deriveKey(encryptionKey, salt);
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
};
