import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AppRole = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";

async function getAppUser() {
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();
  if (!authUser) return null;

  return prisma.user.findUnique({
    where: { supabaseId: authUser.id },
    select: { id: true, role: true },
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, managerId: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const role = appUser.role as AppRole;
    const canEdit =
      role === "ADMIN" || (role === "PROJECT_MANAGER" && project.managerId === appUser.id);
    if (!canEdit) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const budgetSpent = Number(body.budgetSpent);
    if (!Number.isFinite(budgetSpent) || budgetSpent < 0) {
      return NextResponse.json({ error: "budgetSpent must be a non-negative number" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { budgetSpent },
      select: { id: true, budgetSpent: true, updatedAt: true },
    });

    return NextResponse.json({
      ...updated,
      budgetSpent: Number(updated.budgetSpent),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
