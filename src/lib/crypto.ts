import crypto from "crypto";

function getSecretKey(): string {
  const envSecret = process.env.AUTH_SECRET?.trim();
  if (envSecret && envSecret.length >= 24) {
    return envSecret;
  }
  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "CRITICAL: AUTH_SECRET environment variable must be set (minimum 24 characters) in production."
    );
  }
  return "ssph-dev-only-fallback-secret-do-not-use-in-prod-982374";
}

export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const derived = crypto.scryptSync(password, salt, 64).toString("hex");
  return `scrypt:${salt}:${derived}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  const parts = storedHash.split(":");
  if (parts.length !== 3 || parts[0] !== "scrypt") {
    return false;
  }
  const [, salt, originalHex] = parts;
  const derived = crypto.scryptSync(password, salt, 64);
  const original = Buffer.from(originalHex, "hex");
  if (derived.length !== original.length) {
    return false;
  }
  return crypto.timingSafeEqual(derived, original);
}

export function generateOpaqueToken(bytes = 32): string {
  return crypto.randomBytes(bytes).toString("base64url");
}

export function sha256Hex(value: string): string {
  return crypto.createHash("sha256").update(value, "utf8").digest("hex");
}

export function signHmacSha256(payload: string, secretOverride?: string): string {
  const key = secretOverride ?? getSecretKey();
  return crypto.createHmac("sha256", key).update(payload, "utf8").digest("hex");
}

export function verifyHmacSha256(
  payload: string,
  providedHexSignature: string,
  secretOverride?: string
): boolean {
  if (!providedHexSignature || !/^[0-9a-fA-F]+$/.test(providedHexSignature)) {
    return false;
  }
  const expected = signHmacSha256(payload, secretOverride);
  const expectedBuf = Buffer.from(expected, "hex");
  const providedBuf = Buffer.from(providedHexSignature, "hex");
  if (expectedBuf.length !== providedBuf.length) {
    return false;
  }
  return crypto.timingSafeEqual(expectedBuf, providedBuf);
}

export function hashIpAddress(ip: string | null | undefined): string | null {
  if (!ip) return null;
  return sha256Hex(`${getSecretKey()}:${ip}`).slice(0, 24);
}
