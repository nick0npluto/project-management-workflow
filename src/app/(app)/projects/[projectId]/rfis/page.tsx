import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RFIsClient } from "@/components/project/rfis-client";
import { createClient } from "@/lib/supabase/server";

export default async function RFIsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const supabase = await createClient();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  const appUser = authUser
    ? await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { id: true, role: true, fullName: true },
      })
    : null;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      manager: { select: { id: true, fullName: true, role: true } },
      members: {
        select: {
          user: { select: { id: true, fullName: true, role: true } },
        },
      },
    },
  });
  if (!project) notFound();

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

  const projectUsersMap = new Map<string, { id: string; fullName: string; role: string }>();
  projectUsersMap.set(project.manager.id, project.manager);
  for (const member of project.members) {
    projectUsersMap.set(member.user.id, member.user);
  }
  const projectUsers = Array.from(projectUsersMap.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName)
  );

  return (
    <RFIsClient
      projectId={projectId}
      rfis={serialized}
      currentUser={appUser}
      projectUsers={projectUsers}
    />
  );
}
