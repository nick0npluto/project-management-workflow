import { Topbar } from "@/components/layout/topbar";
import { prisma } from "@/lib/prisma";
import { ProjectsGrid } from "@/components/dashboard/projects-grid";

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: {
      manager: { select: { id: true, fullName: true, avatarUrl: true } },
      _count: { select: { rfis: true, tasks: true, dailyLogs: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Projects" subtitle="All Cornerstone Construction jobs" />
      <main className="flex-1 p-4 md:p-6">
        <ProjectsGrid projects={projects} />
      </main>
    </div>
  );
}
