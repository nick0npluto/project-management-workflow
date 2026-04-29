import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { RFIsClient } from "@/components/project/rfis-client";

export default async function RFIsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) notFound();

  const rfis = await prisma.rFI.findMany({
    where: { projectId },
    include: {
      submittedBy: { select: { fullName: true } },
      assignedTo: { select: { fullName: true } },
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

  return <RFIsClient projectId={projectId} rfis={serialized} />;
}
