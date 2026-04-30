import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AppRole = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

const allowedStatuses: TaskStatus[] = ["TODO", "IN_PROGRESS", "BLOCKED", "DONE"];
const allowedPriorities: TaskPriority[] = ["LOW", "MEDIUM", "HIGH"];

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
  if (role === "ADMIN" || role === "EXECUTIVE") return true;

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

async function canCreateTask(projectId: string, userId: string, role: AppRole) {
  if (role === "EXECUTIVE") return false;
  return canAccessProject(projectId, userId, role);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId } = await context.params;
    const role = appUser.role as AppRole;
    const allowed = await canCreateTask(projectId, appUser.id, role);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { title, description, status, priority, assignedToId, dueDate } = body;
    if (!title || !String(title).trim()) {
      return NextResponse.json({ error: "Task title is required" }, { status: 400 });
    }

    const resolvedStatus = allowedStatuses.includes(status) ? status : "TODO";
    const resolvedPriority = allowedPriorities.includes(priority) ? priority : "MEDIUM";

    const existingMaxSort = await prisma.task.findFirst({
      where: { projectId },
      orderBy: { sortOrder: "desc" },
      select: { sortOrder: true },
    });

    const created = await prisma.task.create({
      data: {
        projectId,
        title: String(title).trim(),
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        status: resolvedStatus,
        priority: resolvedPriority,
        assignedToId: assignedToId || null,
        dueDate: dueDate ? new Date(dueDate) : null,
        sortOrder: (existingMaxSort?.sortOrder ?? 0) + 1,
      },
      include: {
        assignedTo: { select: { fullName: true } },
      },
    });

    return NextResponse.json(
      {
        ...created,
        dueDate: created.dueDate ? created.dueDate.toISOString() : null,
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
