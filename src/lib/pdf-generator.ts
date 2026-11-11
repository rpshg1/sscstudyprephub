import fs from "fs/promises";
import path from "path";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

function sanitizeAscii(input: string): string {
  return input.replace(/[^\x20-\x7E]/g, " ");
}

function wrapText(text: string, maxChars = 78): string[] {
  const words = sanitizeAscii(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= maxChars) {
      current += ` ${word}`;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

export interface SamplePdfSpec {
  title: string;
  exam: string;
  subject: string;
  authorSource: string;
  summary: string;
  sections: Array<{ heading: string; bullets: string[] }>;
}

/**
 * Generates a multi-page (16 pages) standards-compliant PDF document clearly marked as
 * DEMO educational sample material so the 10-15 page preview slicer and full PDF
 * download flow operate on realistic multi-page books.
 */
export async function buildSamplePdfBuffer(spec: SamplePdfSpec): Promise<Buffer> {
  const doc = await PDFDocument.create();
  const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const navy = rgb(0.063, 0.106, 0.2);
  const blue = rgb(0.145, 0.388, 0.922);
  const textDark = rgb(0.09, 0.125, 0.2);
  const textMuted = rgb(0.39, 0.45, 0.55);
  const white = rgb(1, 1, 1);
  const border = rgb(0.886, 0.91, 0.941);

  const drawHeaderFooter = (page: ReturnType<typeof doc.addPage>, pageNum: number, total: number) => {
    page.drawRectangle({ x: 36, y: 734, width: 540, height: 42, color: navy });
    page.drawText("SSCSTUDYPREPHUB (SSPH) | DEMO STUDY EDITION", {
      x: 48,
      y: 756,
      size: 11,
      font: fontBold,
      color: white,
    });
    page.drawText(`${sanitizeAscii(spec.exam)}  |  ${sanitizeAscii(spec.subject)}`, {
      x: 48,
      y: 742,
      size: 8.5,
      font: fontRegular,
      color: rgb(0.82, 0.88, 1),
    });

    page.drawLine({
      start: { x: 36, y: 52 },
      end: { x: 576, y: 52 },
      thickness: 0.75,
      color: border,
    });
    page.drawText(
      "DEMO SAMPLE - SSPH is an independent educational hub, not affiliated with SSC or Govt of India.",
      { x: 36, y: 38, size: 8, font: fontRegular, color: textMuted }
    );
    page.drawText(`Page ${pageNum} of ${total}`, {
      x: 520,
      y: 38,
      size: 8,
      font: fontBold,
      color: navy,
    });
  };

  const totalDemoPages = 16;

  // Page 1: Cover & Overview
  const p1 = doc.addPage([612, 792]);
  drawHeaderFooter(p1, 1, totalDemoPages);
  let y = 690;
  for (const line of wrapText(spec.title, 48)) {
    p1.drawText(line, { x: 48, y, size: 18, font: fontBold, color: navy });
    y -= 24;
  }
  y -= 8;
  p1.drawText(`Source: ${sanitizeAscii(spec.authorSource)}`, {
    x: 48,
    y,
    size: 10.5,
    font: fontBold,
    color: blue,
  });
  y -= 24;
  for (const line of wrapText(spec.summary, 80)) {
    p1.drawText(line, { x: 48, y, size: 10.5, font: fontRegular, color: textDark });
    y -= 16;
  }
  y -= 18;
  p1.drawText("Table of Contents (16-Page Demo Edition)", {
    x: 48,
    y,
    size: 12,
    font: fontBold,
    color: navy,
  });
  y -= 18;
  for (let idx = 2; idx <= totalDemoPages; idx++) {
    const sec = spec.sections[(idx - 2) % spec.sections.length];
    p1.drawText(`Page ${idx}: ${sanitizeAscii(sec.heading)} — Revision Unit ${idx - 1}`, {
      x: 56,
      y,
      size: 9.5,
      font: fontRegular,
      color: textDark,
    });
    y -= 15;
  }

  // Pages 2..16: Detailed Study Units & Practice Checkpoints
  for (let pageNum = 2; pageNum <= totalDemoPages; pageNum++) {
    const page = doc.addPage([612, 792]);
    drawHeaderFooter(page, pageNum, totalDemoPages);
    const sec = spec.sections[(pageNum - 2) % spec.sections.length];
    let py = 695;

    page.drawText(`Unit ${pageNum - 1}: ${sanitizeAscii(sec.heading)}`, {
      x: 48,
      y: py,
      size: 14,
      font: fontBold,
      color: navy,
    });
    py -= 22;

    page.drawText(
      `Focus Area: ${sanitizeAscii(spec.subject)} (${sanitizeAscii(spec.exam)}) — Study Checkpoint ${pageNum - 1}`,
      { x: 48, y: py, size: 10, font: fontBold, color: blue }
    );
    py -= 24;

    for (const bullet of sec.bullets) {
      for (const line of wrapText(`• ${bullet}`, 78)) {
        if (py < 90) break;
        page.drawText(line, { x: 52, y: py, size: 10, font: fontRegular, color: textDark });
        py -= 16;
      }
      py -= 6;
    }

    if (py > 140) {
      py -= 10;
      page.drawText("Quick Self-Test & Revision Prompt:", {
        x: 48,
        y: py,
        size: 11,
        font: fontBold,
        color: navy,
      });
      py -= 18;
      for (const line of wrapText(
        `Practice Drill ${pageNum - 1}: Review the key concepts above, write down 3 short-cut formulas or constitutional facts without looking, and time your recall under 90 seconds.`,
        78
      )) {
        page.drawText(line, { x: 52, y: py, size: 10, font: fontRegular, color: textMuted });
        py -= 15;
      }
    }
  }

  doc.setTitle(sanitizeAscii(spec.title));
  doc.setAuthor(sanitizeAscii(spec.authorSource));
  doc.setSubject(sanitizeAscii(spec.subject));

  const bytes = await doc.save();
  return Buffer.from(bytes);
}

export async function writeSamplePdfFile(
  filePath: string,
  spec: SamplePdfSpec
): Promise<{ byteLength: number; buffer: Buffer }> {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  const buffer = await buildSamplePdfBuffer(spec);
  await fs.writeFile(filePath, buffer);
  return { byteLength: buffer.byteLength, buffer };
}
