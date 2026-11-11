import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { complaintSchema } from "@/lib/validation";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import { handleZodError, jsonError } from "@/lib/api-helpers";

export async function POST(req: Request) {
  try {
    const ip = getClientIp(req);
    const limit = checkRateLimit(`complaint:${ip}`, 8, 15 * 60 * 1000);
    if (!limit.allowed) {
      return jsonError("Too many submissions. Please wait a few minutes.", 429);
    }

    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = complaintSchema.parse(body);

    const created = await prisma.complaint.create({
      data: {
        name: parsed.name,
        email: parsed.email,
        type: parsed.type,
        resourceSlug: parsed.resourceSlug || null,
        subject: parsed.subject,
        message: parsed.message,
        evidenceUrl: parsed.evidenceUrl || null,
      },
      select: {
        id: true,
        type: true,
        status: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        complaint: created,
        message:
          "Your request has been logged with our review team. Reference ID: " +
          created.id,
      },
      { status: 201 }
    );
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Complaint submission error:", err);
    return jsonError("Unable to submit your message right now.", 500);
  }
}
