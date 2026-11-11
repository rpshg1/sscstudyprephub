import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  getGoogleDriveConfigStatus,
  syncGoogleDriveFolder,
} from "../src/lib/google-drive";

async function main() {
  const status = getGoogleDriveConfigStatus();
  if (!status.configured) {
    console.log("Google Drive is not configured. Skipping sync.");
    return;
  }

  const autoPublish = process.env.DRIVE_AUTO_PUBLISH === "true";
  const maxImportCount = Number(process.env.DRIVE_MAX_IMPORT || 10);

  console.log("Starting Google Drive auto-sync worker...", {
    authMode: status.authMode,
    autoPublish,
    maxImportCount,
  });

  const summary = await syncGoogleDriveFolder("github_actions_auto", {
    autoPublish,
    maxImportCount,
  });

  console.log("Drive Sync Summary:", summary);
  if (summary.status === "FAILED") {
    process.exitCode = 1;
  }
}

main()
  .catch((err) => {
    console.error("Drive sync worker error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
