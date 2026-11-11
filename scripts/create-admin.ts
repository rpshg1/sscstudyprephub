import crypto from "crypto";
import readline from "readline";
import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/crypto";

const prisma = new PrismaClient();

function parseArg(flag: string): string | undefined {
  const prefix = `--${flag}=`;
  const match = process.argv.find((arg) => arg.startsWith(prefix));
  if (match) return match.slice(prefix.length).trim();
  const idx = process.argv.indexOf(`--${flag}`);
  if (idx !== -1 && process.argv[idx + 1]) {
    return process.argv[idx + 1].trim();
  }
  return undefined;
}

function askPrompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise((resolve) => {
    rl.question(question, (ans) => {
      rl.close();
      resolve(ans.trim());
    });
  });
}

async function main() {
  let email = parseArg("email") || process.env.ADMIN_SEED_EMAIL;
  const name = parseArg("name") || process.env.ADMIN_SEED_NAME || "SSPH Administrator";
  let password = parseArg("password") || process.env.ADMIN_SEED_PASSWORD;

  if (!email) {
    email = await askPrompt("Admin Email: ");
  }
  email = email.toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("Please provide a valid email address.");
  }

  let generated = false;
  if (!password) {
    const entered = await askPrompt(
      "Admin Password (leave blank to auto-generate strong password): "
    );
    if (entered) {
      password = entered;
    } else {
      password = `${crypto.randomBytes(12).toString("base64url")}A1!`;
      generated = true;
    }
  }

  if (password.length < 10) {
    throw new Error("Admin password must be at least 10 characters long for security.");
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      isActive: true,
      membershipTier: "LIFETIME",
      lifetimeActivatedAt: new Date(),
    },
    create: {
      email,
      name,
      passwordHash: hashPassword(password),
      role: "ADMIN",
      isActive: true,
      membershipTier: "LIFETIME",
      lifetimeActivatedAt: new Date(),
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  });

  console.log("\nAdmin account configured successfully:");
  console.log(`  ID:    ${user.id}`);
  console.log(`  Name:  ${user.name}`);
  console.log(`  Email: ${user.email}`);
  console.log(`  Role:  ${user.role}`);
  if (generated) {
    console.log(`  Generated Password (save securely, shown once): ${password}`);
  }
  console.log("");
}

main()
  .catch((err) => {
    console.error("Failed to create admin:", err.message || err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
