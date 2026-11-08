import { access, mkdir, unlink as removeFile, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { randomUUID } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { uploadStreamMock, destroyMock } = vi.hoisted(() => ({
  uploadStreamMock: vi.fn(),
  destroyMock: vi.fn(),
}));

vi.mock("cloudinary", () => ({
  v2: {
    uploader: {
      upload_stream: uploadStreamMock,
      destroy: destroyMock,
    },
  },
}));

import { deleteUpload, saveUpload } from "@/lib/storage";

function uploadFile(): File {
  return new File(["image"], "image.png", { type: "image/png" });
}

describe("media storage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("does not try to unlink static public assets on Vercel", async () => {
    const uploadDir = resolve("public", "uploads");
    const fileName = `.delete-test-${randomUUID()}`;
    const filePath = join(uploadDir, fileName);
    await mkdir(uploadDir, { recursive: true });
    await writeFile(filePath, "test");
    vi.stubEnv("VERCEL", "1");

    try {
      await expect(
        deleteUpload(join("public", "uploads", fileName))
      ).resolves.toBeUndefined();
      await expect(access(filePath)).resolves.toBeUndefined();
    } finally {
      await removeFile(filePath);
    }
  });

  it("requires Cloudinary for public image uploads on Vercel", async () => {
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("CLOUDINARY_URL", "");

    await expect(
      saveUpload(uploadFile(), { isPublic: true, kind: "image" })
    ).rejects.toThrow("Public image uploads on Vercel require CLOUDINARY_URL");
  });

  it("rejects a masked Cloudinary URL before trying an upload", async () => {
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("CLOUDINARY_URL", "cloudinary://key:********@account");

    await expect(
      saveUpload(uploadFile(), { isPublic: true, kind: "image" })
    ).rejects.toThrow("CLOUDINARY_URL is incomplete or masked");
    expect(uploadStreamMock).not.toHaveBeenCalled();
  });
});
