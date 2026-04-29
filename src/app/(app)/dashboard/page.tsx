import { Topbar } from "@/components/layout/topbar";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { prisma } from "@/lib/prisma";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";

export default async function DashboardPage() {
  const projects = await prisma.project.findMany({
    include: {
      manager: { select: { id: true, fullName: true, avatarUrl: true } },
      _count: { select: { rfis: true, tasks: true, dailyLogs: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  const activeProjects = projects.filter((p) => p.status === "ACTIVE").length;
  const totalBudget = projects.reduce((sum, p) => sum + Number(p.budgetTotal ?? 0), 0);
  const openRFIs = await prisma.rFI.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } });
  const overdueTasks = await prisma.task.count({
    where: { status: { not: "DONE" }, dueDate: { lt: new Date() } },
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Dashboard" subtitle="Cornerstone Construction — Project Overview" />
      <main className="flex-1 p-4 md:p-6 space-y-6">
        <StatsCards
          activeProjects={activeProjects}
          totalBudget={totalBudget}
          openRFIs={openRFIs}
          overdueTasks={overdueTasks}
        />
        <ProjectsGrid projects={projects} />
      </main>
    </div>
  );
}
