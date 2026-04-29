import { notFound } from "next/navigation";
import { FileText, FileCheck, FileSignature, Camera, File, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/utils";

const typeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PLAN: FileText,
  PERMIT: FileCheck,
  CONTRACT: FileSignature,
  INSPECTION: FileCheck,
  PHOTO: Camera,
  OTHER: File,
};

function formatFileSize(bytes: number) {
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({ where: { id: projectId }, select: { id: true } });
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

  return (
    <div className="space-y-4 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Documents</h2>
          <p className="text-sm text-muted-foreground">{docs.length} file{docs.length !== 1 ? "s" : ""}</p>
        </div>
        <Button size="sm" variant="outline" disabled>
          <Upload className="h-4 w-4 mr-1.5" />
          Upload
        </Button>
      </div>

      {docs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No documents uploaded yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Name</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Type</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-16">Ver.</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-32 hidden md:table-cell">
                  Uploaded By
                </th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-20 hidden md:table-cell">
                  Size
                </th>
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => {
                const Icon = typeIconMap[doc.type] ?? File;
                return (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground capitalize">
                      {doc.type.charAt(0) + doc.type.slice(1).toLowerCase()}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      v{doc.version ?? "1.0"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {uploaderMap[doc.uploadedById] ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {doc.fileSize ? formatFileSize(doc.fileSize) : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
