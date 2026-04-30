import { Topbar } from "@/components/layout/topbar";
import { prisma } from "@/lib/prisma";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";

export default async function ProjectsPage() {
  const [projects, managers] = await Promise.all([
    prisma.project.findMany({
      include: {
        manager: { select: { id: true, fullName: true, avatarUrl: true } },
        _count: {
          select: {
            rfis: { where: { status: "OPEN" } },
            tasks: true,
            dailyLogs: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: { in: ["PROJECT_MANAGER", "ADMIN"] } },
      select: { id: true, fullName: true },
      orderBy: { fullName: "asc" },
    }),
  ]);

  const serialized = projects.map((p) => ({
    ...p,
    budgetTotal: p.budgetTotal != null ? Number(p.budgetTotal) : null,
    budgetSpent: Number(p.budgetSpent),
    startDate: p.startDate?.toISOString() ?? null,
    targetEndDate: p.targetEndDate?.toISOString() ?? null,
    actualEndDate: p.actualEndDate?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Projects" subtitle="All Cornerstone Construction jobs" />
      <main className="flex-1 p-4 md:p-6">
        <ProjectsGrid projects={serialized} managers={managers} />
      </main>
    </div>
  );
}
