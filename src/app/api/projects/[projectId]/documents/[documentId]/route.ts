import { NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AppRole = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
const storageBucket = "project-documents";

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

async function canDeleteFromProject(projectId: string, userId: string, role: AppRole) {
  if (role === "EXECUTIVE") return false;
  return canAccessProject(projectId, userId, role);
}

function extractStoragePath(fileUrl: string) {
  const marker = `/storage/v1/object/public/${storageBucket}/`;
  const idx = fileUrl.indexOf(marker);
  if (idx < 0) return null;
  return decodeURIComponent(fileUrl.slice(idx + marker.length));
}

export async function DELETE(
  _req: Request,
  context: { params: Promise<{ projectId: string; documentId: string }> }
) {
  try {
    const appUser = await getAppUser();
    if (!appUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { projectId, documentId } = await context.params;
    const role = appUser.role as AppRole;
    const allowed = await canDeleteFromProject(projectId, appUser.id, role);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const doc = await prisma.document.findFirst({
      where: { id: documentId, projectId },
      select: { id: true, fileUrl: true },
    });
    if (!doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceRoleKey) {
      const admin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false },
      });
      const objectPath = extractStoragePath(doc.fileUrl);
      if (objectPath) {
        await admin.storage.from(storageBucket).remove([objectPath]);
      }
    }

    await prisma.document.delete({ where: { id: doc.id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
