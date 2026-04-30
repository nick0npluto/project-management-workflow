import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseAdmin } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

type AppRole = "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
type DocumentType = "PLAN" | "PERMIT" | "CONTRACT" | "INSPECTION" | "PHOTO" | "OTHER";

const allowedTypes: DocumentType[] = ["PLAN", "PERMIT", "CONTRACT", "INSPECTION", "PHOTO", "OTHER"];
const storageBucket = "project-documents";

function sanitizeFilename(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_");
}

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

async function canUploadToProject(projectId: string, userId: string, role: AppRole) {
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
    const allowed = await canUploadToProject(projectId, appUser.id, role);
    if (!allowed) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const formData = await req.formData();
    const file = formData.get("file");
    const type = formData.get("type");
    const description = formData.get("description");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "File is required" }, { status: 400 });
    }
    if (file.size === 0) {
      return NextResponse.json({ error: "File cannot be empty" }, { status: 400 });
    }

    const resolvedType = typeof type === "string" && allowedTypes.includes(type as DocumentType)
      ? (type as DocumentType)
      : "OTHER";

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json({ error: "Supabase is not configured" }, { status: 500 });
    }

    const admin = createSupabaseAdmin(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingBucket } = await admin.storage.getBucket(storageBucket);
    if (!existingBucket) {
      const { error: createBucketError } = await admin.storage.createBucket(storageBucket, {
        public: true,
        fileSizeLimit: "20MB",
      });
      if (createBucketError) {
        return NextResponse.json({ error: createBucketError.message }, { status: 500 });
      }
    }

    const safeName = sanitizeFilename(file.name);
    const objectPath = `${projectId}/${Date.now()}-${safeName}`;
    const uploadResult = await admin.storage.from(storageBucket).upload(objectPath, file, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

    if (uploadResult.error) {
      return NextResponse.json({ error: uploadResult.error.message }, { status: 500 });
    }

    const publicUrl = admin.storage.from(storageBucket).getPublicUrl(objectPath).data.publicUrl;

    const doc = await prisma.document.create({
      data: {
        projectId,
        name: file.name,
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        type: resolvedType,
        fileUrl: publicUrl,
        fileSize: file.size,
        mimeType: file.type || null,
        uploadedById: appUser.id,
      },
    });

    return NextResponse.json(
      { ...doc, createdAt: doc.createdAt.toISOString() },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
