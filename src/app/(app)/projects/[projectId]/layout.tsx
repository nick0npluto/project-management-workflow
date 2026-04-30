import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, User } from "lucide-react";
import { StatusBadge } from "@/components/shared/status-badge";
import { ProjectStatusControl } from "@/components/project/project-status-control";
import { ProjectTabs } from "@/components/project/project-tabs";
import { prisma } from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
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
    include: {
      manager: { select: { id: true, fullName: true } },
      _count: {
        select: {
          rfis: { where: { status: "OPEN" } },
          tasks: true,
        },
      },
    },
  });

  if (!project) notFound();

  const canEditStatus =
    appUser != null &&
    (appUser.role === "ADMIN" ||
      (appUser.role === "PROJECT_MANAGER" && project.manager.id === appUser.id));

  return (
    <div className="flex flex-col flex-1">
      <div className="border-b border-border bg-card px-4 md:px-6 pt-5 pb-0">
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              {project.projectNumber && (
                <span className="text-xs font-mono text-muted-foreground">{project.projectNumber}</span>
              )}
              <StatusBadge type="project" value={project.status} />
              {canEditStatus && (
                <ProjectStatusControl projectId={projectId} currentStatus={project.status} />
              )}
            </div>
            <h1 className="text-xl font-bold text-foreground">{project.name}</h1>
            <div className="flex flex-wrap items-center gap-4 mt-1.5 text-sm text-muted-foreground">
              {(project.city || project.state) && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" />
                  {[project.city, project.state].filter(Boolean).join(", ")}
                </span>
              )}
              <span className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                {project.manager.fullName}
              </span>
              {project.targetEndDate && (
                <span>Due {formatDate(project.targetEndDate)}</span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-6 text-center shrink-0">
            <div>
              <p className="text-2xl font-bold text-foreground">{project.completionPct}%</p>
              <p className="text-xs text-muted-foreground">Complete</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{project._count.rfis}</p>
              <p className="text-xs text-muted-foreground">Open RFIs</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{project._count.tasks}</p>
              <p className="text-xs text-muted-foreground">Tasks</p>
            </div>
          </div>
        </div>

        <ProjectTabs projectId={projectId} />
      </div>

      <div className="flex-1 p-4 md:p-6">{children}</div>
    </div>
  );
}
