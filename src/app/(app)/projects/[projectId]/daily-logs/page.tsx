import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { DailyLogsClient } from "@/components/project/daily-logs-client";

export default async function DailyLogsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
  if (!project) notFound();

  const logs = await prisma.dailyLog.findMany({
    where: { projectId },
    include: { submittedBy: { select: { fullName: true } } },
    orderBy: { logDate: "desc" },
  });

  const serialized = logs.map((log) => ({
    ...log,
    logDate: log.logDate.toISOString(),
    hoursWorked: log.hoursWorked != null ? Number(log.hoursWorked) : null,
    createdAt: log.createdAt.toISOString(),
    updatedAt: log.updatedAt.toISOString(),
  }));

  return <DailyLogsClient projectId={projectId} logs={serialized} />;
}
