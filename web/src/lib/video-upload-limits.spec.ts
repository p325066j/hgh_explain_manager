import { describe, expect, it } from "vitest";
import {
  detectVideoContainerFromHead,
  getVideoUploadMaxBytes,
  validateVideoUploadFile,
} from "./video-upload-limits";

const makeFile = (parts: {
  name: string;
  type: string;
  bytes: Uint8Array;
}) => {
  const blob = new Blob([Buffer.from(parts.bytes)], { type: parts.type });
  return new File([blob], parts.name, { type: parts.type });
};

const mp4Head = new Uint8Array([
  0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70, 0x69, 0x73, 0x6f, 0x6d,
]);

describe("video-upload-limits", () => {
  it("defaults max bytes to 500MB", () => {
    expect(getVideoUploadMaxBytes()).toBe(500 * 1024 * 1024);
  });

  it("detects mp4 container from ftyp", () => {
    expect(detectVideoContainerFromHead(mp4Head)).toBe("iso");
  });

  it("rejects oversize files", async () => {
    const huge = makeFile({
      name: "big.mp4",
      type: "video/mp4",
      bytes: mp4Head,
    });
    Object.defineProperty(huge, "size", { value: getVideoUploadMaxBytes() + 1 });

    const result = await validateVideoUploadFile(huge);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.fieldErrors?.file?.[0]).toContain("上限");
    }
  });

  it("rejects unsupported extension", async () => {
    const file = makeFile({
      name: "evil.exe",
      type: "video/mp4",
      bytes: mp4Head,
    });
    const result = await validateVideoUploadFile(file);
    expect(result.ok).toBe(false);
  });

  it("accepts valid mp4", async () => {
    const file = makeFile({
      name: "sample.mp4",
      type: "video/mp4",
      bytes: mp4Head,
    });
    const result = await validateVideoUploadFile(file);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.contentType).toBe("video/mp4");
    }
  });
});
