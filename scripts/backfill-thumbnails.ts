import { prisma } from "../src/lib/prisma";
import { backfillPdfThumbnails } from "../src/lib/thumbnails";

async function main() {
  const overwrite = process.argv.includes("--overwrite");
  const summary = await backfillPdfThumbnails(overwrite);
  console.log("Page-1 PDF Thumbnail Backfill Complete:", summary);
}

main()
  .catch((err) => {
    console.error("Thumbnail backfill failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
