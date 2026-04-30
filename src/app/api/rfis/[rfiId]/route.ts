import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AppRole = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
type RfiAction = "assign" | "answer" | "close";

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

async function canAccessProject(projectId: string, userId: string, role: AppRole) {
  if (role === "EXECUTIVE" || role === "ADMIN") return true;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: { managerId: true },
  });

  if (!project) return false;
  if (project.managerId === userId) return true;

  const membership = await prisma.projectMember.findUnique({
    where: { projectId_userId: { projectId, userId } },
    select: { id: true },
  });

  return Boolean(membership);
}

async function canDeleteRfi(projectId: string, userId: string, role: AppRole) {
  if (!["FIELD_SUPERVISOR", "PROJECT_MANAGER"].includes(role)) return false;
  return canAccessProject(projectId, userId, role);
}

export async function PATCH(req: NextRequest, context: { params: Promise<{ rfiId: string }> }) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rfiId } = await context.params;
    const rfi = await prisma.rFI.findUnique({
      where: { id: rfiId },
      include: {
        project: { select: { managerId: true } },
      },
    });

    if (!rfi) {
      return NextResponse.json({ error: "RFI not found" }, { status: 404 });
    }

    const role = appUser.role as AppRole;
    const hasAccess = await canAccessProject(rfi.projectId, appUser.id, role);
    if (!hasAccess) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (role === "EXECUTIVE") {
      return NextResponse.json({ error: "Executives have read-only RFI access" }, { status: 403 });
    }

    const body = await req.json();
    const action = body.action as RfiAction;
    if (!action || !["assign", "answer", "close"].includes(action)) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    if (action === "assign") {
      if (role !== "PROJECT_MANAGER") {
        return NextResponse.json({ error: "Only Project Managers can assign RFIs" }, { status: 403 });
      }
      if (!["OPEN", "IN_REVIEW"].includes(rfi.status)) {
        return NextResponse.json({ error: "Can only assign RFIs that are open or in review" }, { status: 400 });
      }

      const assignedToId = body.assignedToId || null;
      if (!assignedToId) {
        return NextResponse.json({ error: "assignedToId is required when assigning an RFI" }, { status: 400 });
      }
      const dueDate = body.dueDate ? new Date(body.dueDate) : null;

      const updated = await prisma.rFI.update({
        where: { id: rfi.id },
        data: {
          assignedToId,
          dueDate,
          status: "IN_REVIEW",
        },
        include: {
          submittedBy: { select: { id: true, fullName: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
      });

      return NextResponse.json({
        ...updated,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        answeredAt: updated.answeredAt ? updated.answeredAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    if (action === "answer") {
      if (role !== "PROJECT_MANAGER") {
        return NextResponse.json({ error: "Only Project Managers can answer RFIs" }, { status: 403 });
      }
      if (rfi.status !== "IN_REVIEW") {
        return NextResponse.json({ error: "RFI must be in review before answering" }, { status: 400 });
      }

      const answer = String(body.answer ?? "").trim();
      if (!answer) {
        return NextResponse.json({ error: "Answer is required" }, { status: 400 });
      }

      const updated = await prisma.rFI.update({
        where: { id: rfi.id },
        data: {
          answer,
          answeredAt: new Date(),
          status: "ANSWERED",
        },
        include: {
          submittedBy: { select: { id: true, fullName: true } },
          assignedTo: { select: { id: true, fullName: true } },
        },
      });

      return NextResponse.json({
        ...updated,
        dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
        answeredAt: updated.answeredAt ? updated.answeredAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
        updatedAt: updated.updatedAt.toISOString(),
      });
    }

    if (role !== "PROJECT_MANAGER") {
      return NextResponse.json({ error: "Only Project Managers can close RFIs" }, { status: 403 });
    }
    if (rfi.status !== "ANSWERED") {
      return NextResponse.json({ error: "RFI must be answered before closing" }, { status: 400 });
    }

    const updated = await prisma.rFI.update({
      where: { id: rfi.id },
      data: {
        status: "CLOSED",
      },
      include: {
        submittedBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json({
      ...updated,
      dueDate: updated.dueDate ? updated.dueDate.toISOString() : null,
      answeredAt: updated.answeredAt ? updated.answeredAt.toISOString() : null,
      createdAt: updated.createdAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, context: { params: Promise<{ rfiId: string }> }) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { rfiId } = await context.params;
    const rfi = await prisma.rFI.findUnique({
      where: { id: rfiId },
      select: { id: true, projectId: true },
    });
    if (!rfi) {
      return NextResponse.json({ error: "RFI not found" }, { status: 404 });
    }

    const role = appUser.role as AppRole;
    const allowed = await canDeleteRfi(rfi.projectId, appUser.id, role);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await prisma.rFI.delete({ where: { id: rfi.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
