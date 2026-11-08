import { hash, compare } from "bcryptjs";

const ROUNDS = 12;

/** Hash a plaintext password. */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, ROUNDS);
}

/** Verify a plaintext password against a stored hash. */
export async function verifyPassword(
  password: string,
  hashed: string
): Promise<boolean> {
  return compare(password, hashed);
}
