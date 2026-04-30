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
    select: { id: true, role: true, fullName: true },
  });
}

async function canReadProject(projectId: string, userId: string, role: AppRole) {
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

async function canCreateRfi(projectId: string, userId: string, role: AppRole) {
  if (!["FIELD_SUPERVISOR", "PROJECT_MANAGER"].includes(role)) return false;
  return canReadProject(projectId, userId, role);
}

export async function GET(req: NextRequest) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const projectId = req.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }

    const allowed = await canReadProject(projectId, appUser.id, appUser.role as AppRole);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const rfis = await prisma.rFI.findMany({
      where: { projectId },
      include: {
        submittedBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
      orderBy: { rfiNumber: "asc" },
    });

    const serialized = rfis.map((r) => ({
      ...r,
      dueDate: r.dueDate ? r.dueDate.toISOString() : null,
      answeredAt: r.answeredAt ? r.answeredAt.toISOString() : null,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    }));

    return NextResponse.json(serialized);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { projectId, title, description, priority, dueDate, assignedToId } = body;

    if (!projectId || !title || !description) {
      return NextResponse.json({ error: "projectId, title, and description are required" }, { status: 400 });
    }

    const allowed = await canCreateRfi(projectId, appUser.id, appUser.role as AppRole);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const maxRfi = await prisma.rFI.findFirst({
      where: { projectId },
      orderBy: { rfiNumber: "desc" },
      select: { rfiNumber: true },
    });

    const nextRfiNumber = (maxRfi?.rfiNumber ?? 0) + 1;
    const normalizedPriority = ["LOW", "MEDIUM", "HIGH", "URGENT"].includes(priority)
      ? priority
      : "MEDIUM";

    const project = await prisma.project.findUnique({
      where: { id: projectId },
      select: { managerId: true },
    });
    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const canAssignOnCreate = appUser.role === "PROJECT_MANAGER";
    const finalAssignedToId = canAssignOnCreate ? assignedToId || project.managerId : null;

    const created = await prisma.rFI.create({
      data: {
        projectId,
        rfiNumber: nextRfiNumber,
        title: String(title).trim(),
        description: String(description).trim(),
        priority: normalizedPriority,
        status: finalAssignedToId ? "IN_REVIEW" : "OPEN",
        dueDate: dueDate ? new Date(dueDate) : null,
        submittedById: appUser.id,
        assignedToId: finalAssignedToId,
      },
      include: {
        submittedBy: { select: { id: true, fullName: true } },
        assignedTo: { select: { id: true, fullName: true } },
      },
    });

    return NextResponse.json(
      {
        ...created,
        dueDate: created.dueDate ? created.dueDate.toISOString() : null,
        answeredAt: created.answeredAt ? created.answeredAt.toISOString() : null,
        createdAt: created.createdAt.toISOString(),
        updatedAt: created.updatedAt.toISOString(),
      },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
