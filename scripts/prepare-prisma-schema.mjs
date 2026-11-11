import fs from "node:fs";
import path from "node:path";

function resolveDatabaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL.trim();
  const envPath = path.resolve(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, "utf8");
    const match = content.match(/^DATABASE_URL\s*=\s*["']?([^"'\r\n]+)["']?/m);
    if (match?.[1]) return match[1].trim();
  }
  return "";
}

const dbUrl = resolveDatabaseUrl();
if (dbUrl.startsWith("postgres://") || dbUrl.startsWith("postgresql://")) {
  const src = path.resolve(process.cwd(), "prisma", "schema.postgresql.prisma");
  const dst = path.resolve(process.cwd(), "prisma", "schema.prisma");
  fs.copyFileSync(src, dst);
  console.log("[SSPH] Detected PostgreSQL DATABASE_URL — active schema set to PostgreSQL.");
} else {
  console.log("[SSPH] Using SQLite prisma/schema.prisma.");
}
