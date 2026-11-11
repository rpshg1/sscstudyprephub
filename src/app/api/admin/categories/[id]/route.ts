import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminCategorySchema } from "@/lib/validation";
import { handleZodError, jsonError, requireApiAdmin } from "@/lib/api-helpers";

const partialCat = adminCategorySchema.partial();

export async function PATCH(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { errorResponse } = await requireApiAdmin();
    if (errorResponse) return errorResponse;

    const { id } = await context.params;
    const body = await req.json().catch(() => null);
    if (!body) return jsonError("Invalid JSON body.", 400);

    const parsed = partialCat.parse(body);
    const updated = await prisma.category.update({
      where: { id },
      data: parsed,
    });

    return NextResponse.json({ category: updated });
  } catch (err) {
    const zodResp = handleZodError(err);
    if (zodResp) return zodResp;
    return jsonError("Could not update category.", 400);
  }
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireApiAdmin();
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const count = await prisma.resource.count({ where: { categoryId: id } });
  if (count > 0) {
    return jsonError(
      `Cannot delete category with ${count} assigned resources. Reassign or deactivate it instead.`,
      400
    );
  }

  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}
