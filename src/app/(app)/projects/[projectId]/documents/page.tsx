import { FileText, FileCheck, FileSignature, Camera, File, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

const typeIconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  PLAN: FileText,
  PERMIT: FileCheck,
  CONTRACT: FileSignature,
  INSPECTION: FileCheck,
  PHOTO: Camera,
  OTHER: File,
};

const mockDocs = [
  { id: "d1", name: "Architectural Plans - SD Set Rev 4", type: "PLAN", version: "4.0", uploaderName: "Sarah Chen", fileSize: 48_200_000, createdAt: new Date("2026-04-01") },
  { id: "d2", name: "City of Tempe Building Permit", type: "PERMIT", version: "1.0", uploaderName: "Lisa Patel", fileSize: 1_200_000, createdAt: new Date("2024-02-15") },
  { id: "d3", name: "General Contract — Desert Sun Properties", type: "CONTRACT", version: "1.0", uploaderName: "Lisa Patel", fileSize: 3_800_000, createdAt: new Date("2024-03-01") },
  { id: "d4", name: "MEP Rough-In Inspection Report — Level 2", type: "INSPECTION", version: "1.0", uploaderName: "Diego Ramirez", fileSize: 890_000, createdAt: new Date("2026-04-20") },
];

function formatFileSize(bytes: number) {
  if (bytes < 1_000_000) return `${(bytes / 1000).toFixed(0)} KB`;
  return `${(bytes / 1_000_000).toFixed(1)} MB`;
}

export default async function DocumentsPage({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = await params;
  const docs = projectId === "proj-001" ? mockDocs : [];

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
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-32">Uploaded By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Date</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-20">Size</th>
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
                    <td className="px-4 py-3 text-muted-foreground">{doc.type.charAt(0) + doc.type.slice(1).toLowerCase()}</td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">v{doc.version}</td>
                    <td className="px-4 py-3 text-muted-foreground">{doc.uploaderName}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(doc.createdAt)}</td>
                    <td className="px-4 py-3 text-muted-foreground">{formatFileSize(doc.fileSize)}</td>
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
