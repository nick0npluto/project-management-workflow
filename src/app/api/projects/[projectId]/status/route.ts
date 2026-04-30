import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AppRole = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
type ProjectStatus = "PLANNING" | "ACTIVE" | "ON_HOLD" | "COMPLETED" | "CANCELLED";

const allowedStatuses: ProjectStatus[] = ["PLANNING", "ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const supabase = await createClient();
    const {
      data: { user: authUser },
    } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const appUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      select: { id: true, role: true },
    });

    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { id: true, managerId: true, status: true },
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
    const nextStatus = body.status as ProjectStatus;
    if (!allowedStatuses.includes(nextStatus)) {
      return NextResponse.json({ error: "Invalid project status" }, { status: 400 });
    }

    if (nextStatus === project.status) {
      return NextResponse.json({ error: "Project is already in this status" }, { status: 400 });
    }

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { status: nextStatus },
      select: { id: true, status: true, updatedAt: true },
    });

    return NextResponse.json({
      ...updated,
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
