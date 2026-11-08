/**
 * Core unit tests — run with `npm test`.
 *
 * These tests do NOT require a live database or running server.
 * They cover:
 *   1. Validation schemas (contact form, project, login)
 *   2. Utility functions (slugify, uniqueSlug, truncate, formatDate, initials)
 *   3. Password hashing and verification
 *   4. JWT session signing and verification
 */

import { describe, it, expect, beforeAll } from "vitest";

// ---- 1. Validation --------------------------------------------------------

import { contactSchema, loginSchema, projectSchema } from "@/lib/validation/schemas";

describe("contactSchema", () => {
  const valid = {
    name: "Jane Doe",
    email: "jane@example.com",
    inquiryType: "FREELANCE_PROJECT",
    subject: "Let's build something",
    message: "I have a project idea I'd like to discuss with you.",
    company: "",
  };

  it("accepts valid input", () => {
    const r = contactSchema.safeParse(valid);
    expect(r.success).toBe(true);
  });

  it("rejects a short name", () => {
    const r = contactSchema.safeParse({ ...valid, name: "A" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const r = contactSchema.safeParse({ ...valid, email: "not-an-email" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid inquiry type", () => {
    const r = contactSchema.safeParse({ ...valid, inquiryType: "SPAM" });
    expect(r.success).toBe(false);
  });

  it("rejects a message that is too short", () => {
    const r = contactSchema.safeParse({ ...valid, message: "Hi" });
    expect(r.success).toBe(false);
  });

  it("flags a filled honeypot", () => {
    const r = contactSchema.safeParse({ ...valid, company: "SpamCo" });
    expect(r.success).toBe(false);
  });
});

describe("loginSchema", () => {
  it("accepts valid credentials", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "12345678" });
    expect(r.success).toBe(true);
  });

  it("rejects a password shorter than 8 chars", () => {
    const r = loginSchema.safeParse({ email: "a@b.com", password: "short" });
    expect(r.success).toBe(false);
  });

  it("rejects a malformed email", () => {
    const r = loginSchema.safeParse({ email: "bad", password: "12345678" });
    expect(r.success).toBe(false);
  });
});

describe("projectSchema", () => {
  it("accepts a minimal draft", () => {
    const r = projectSchema.safeParse({ title: "My project", status: "DRAFT" });
    expect(r.success).toBe(true);
  });

  it("rejects an empty title", () => {
    const r = projectSchema.safeParse({ title: "", status: "DRAFT" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid status", () => {
    const r = projectSchema.safeParse({ title: "X", status: "LIVE" });
    expect(r.success).toBe(false);
  });

  it("defaults technologies to an empty array", () => {
    const r = projectSchema.safeParse({ title: "X" });
    if (!r.success) throw r.error;
    expect(r.data.technologies).toEqual([]);
  });
});

// ---- 2. Utils -------------------------------------------------------------

import {
  slugify,
  uniqueSlug,
  truncate,
  initials,
  parseList,
} from "@/lib/utils";

describe("slugify", () => {
  it("lowercases and replaces spaces with hyphens", () => {
    expect(slugify("Hello World")).toBe("hello-world");
  });

  it("removes special characters", () => {
    expect(slugify("Hello, World!")).toBe("hello-world");
  });

  it("collapses multiple hyphens", () => {
    expect(slugify("A--B--C")).toBe("a-b-c");
  });

  it("handles a slug that already looks good", () => {
    expect(slugify("my-project")).toBe("my-project");
  });
});

describe("uniqueSlug", () => {
  it("returns base when not taken", () => {
    expect(uniqueSlug("foo", ["bar", "baz"])).toBe("foo");
  });

  it("appends -2 on first collision", () => {
    expect(uniqueSlug("foo", ["foo"])).toBe("foo-2");
  });

  it("increments until unique", () => {
    expect(uniqueSlug("foo", ["foo", "foo-2", "foo-3"])).toBe("foo-4");
  });
});

describe("truncate", () => {
  it("returns the string unchanged if within max", () => {
    expect(truncate("hello", 10)).toBe("hello");
  });

  it("truncates and appends ellipsis", () => {
    const r = truncate("hello world", 8);
    expect(r.length).toBeLessThanOrEqual(8);
    expect(r.endsWith("…")).toBe(true);
  });
});

describe("initials", () => {
  it("returns two initials for a two-word name", () => {
    expect(initials("Jane Doe")).toBe("JD");
  });

  it("returns one initial for a single name", () => {
    expect(initials("Mukti")).toBe("M");
  });
});

describe("parseList", () => {
  it("splits on commas", () => {
    expect(parseList("a, b, c")).toEqual(["a", "b", "c"]);
  });

  it("splits on newlines", () => {
    expect(parseList("a\nb\nc")).toEqual(["a", "b", "c"]);
  });

  it("returns [] for empty input", () => {
    expect(parseList("")).toEqual([]);
    expect(parseList(null)).toEqual([]);
    expect(parseList(undefined)).toEqual([]);
  });
});

// ---- 3. Password hashing --------------------------------------------------

import { hashPassword, verifyPassword } from "@/lib/auth/password";

describe("password hashing", () => {
  it("hashes and verifies a password", async () => {
    const hash = await hashPassword("supersecret1!");
    expect(hash).not.toBe("supersecret1!");
    expect(hash.startsWith("$2b$")).toBe(true);
    const ok = await verifyPassword("supersecret1!", hash);
    expect(ok).toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("correct");
    const ok = await verifyPassword("wrong", hash);
    expect(ok).toBe(false);
  });
});

// ---- 4. Session JWT -------------------------------------------------------

import { signSession, verifySessionToken } from "@/lib/auth/session";

const TEST_SECRET = "test-secret-at-least-32-chars-long!!";

beforeAll(() => {
  process.env.AUTH_SECRET = TEST_SECRET;
});

describe("JWT sessions", () => {
  const admin = { id: "abc123", email: "admin@example.com", name: "Mukti" };

  it("signs and verifies a valid session", async () => {
    const token = await signSession(admin);
    const session = await verifySessionToken(token);
    expect(session?.id).toBe(admin.id);
    expect(session?.email).toBe(admin.email);
    expect(session?.name).toBe(admin.name);
  });

  it("returns null for an invalid token", async () => {
    const session = await verifySessionToken("not.a.token");
    expect(session).toBeNull();
  });

  it("returns null for undefined", async () => {
    const session = await verifySessionToken(undefined);
    expect(session).toBeNull();
  });

  it("rejects a token signed with a different secret", async () => {
    process.env.AUTH_SECRET = "different-secret-at-least-32-chars!";
    const token = await signSession(admin);
    process.env.AUTH_SECRET = TEST_SECRET;
    const session = await verifySessionToken(token);
    expect(session).toBeNull();
  });
});
