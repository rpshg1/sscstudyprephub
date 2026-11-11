import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminComplaintUpdateSchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON request body.", 400);

    const parsed = adminComplaintUpdateSchema.parse(body);

    const complaint = await prisma.complaint.findUnique({ where: { id } });
    if (!complaint) {
      return jsonError("Complaint not found.", 404);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const c = await tx.complaint.update({
        where: { id },
        data: {
          status: parsed.status,
          ...(parsed.adminNotes !== undefined ? { adminNotes: parsed.adminNotes } : {}),
        },
      });

      if (parsed.unpublishLinkedResource && complaint.resourceSlug) {
        await tx.resource.updateMany({
          where: { slug: complaint.resourceSlug },
          data: { isPublished: false },
        });
      }

      return c;
    });

    return NextResponse.json({ complaint: updated });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    console.error("Admin complaint update error:", err);
    return jsonError("Could not update complaint.", 500);
  }
}
