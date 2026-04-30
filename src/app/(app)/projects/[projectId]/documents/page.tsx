import { notFound } from "next/navigation";
import { DocumentsClient } from "@/components/project/documents-client";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const appUser = authUser
    ? await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { id: true, role: true },
      })
    : null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      managerId: true,
      members: { select: { userId: true } },
    },
  });
  if (!project) notFound();

  const docs = await prisma.document.findMany({
    where: { projectId },
    include: { project: { select: { manager: { select: { fullName: true } } } } },
    orderBy: { createdAt: "desc" },
  });

  // Fetch uploader names separately since Document has uploadedById but no relation
  const uploaderIds = [...new Set(docs.map((d) => d.uploadedById))];
  const uploaders = await prisma.user.findMany({
    where: { id: { in: uploaderIds } },
    select: { id: true, fullName: true },
  });
  const uploaderMap = Object.fromEntries(uploaders.map((u) => [u.id, u.fullName]));

  const canUpload =
    appUser != null &&
    appUser.role !== "EXECUTIVE" &&
    (appUser.role === "ADMIN" ||
      project.managerId === appUser.id ||
      project.members.some((member) => member.userId === appUser.id));

  const serialized = docs.map((doc) => ({
    ...doc,
    createdAt: doc.createdAt.toISOString(),
  }));

  return (
    <DocumentsClient
      projectId={projectId}
      docs={serialized}
      uploaderMap={uploaderMap}
      canUpload={canUpload}
    />
  );
}
