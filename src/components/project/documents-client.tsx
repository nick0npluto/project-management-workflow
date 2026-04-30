"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, FileCheck, FileSignature, Camera, File, Upload, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SectionHeader } from "@/components/project/section-header";
import { formatDate } from "@/lib/utils";

type DocumentType = "PLAN" | "PERMIT" | "CONTRACT" | "INSPECTION" | "PHOTO" | "OTHER";

interface DocRow {
  id: string;
  name: string;
  type: DocumentType;
  fileUrl: string;
  fileSize: number | null;
  version: string | null;
  uploadedById: string;
  createdAt: string;
}

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

export function DocumentsClient({
  projectId,
  docs,
  uploaderMap,
  canUpload,
}: {
  projectId: string;
  docs: DocRow[];
  uploaderMap: Record<string, string>;
  canUpload: boolean;
}) {
  const router = useRouter();
  const [showUpload, setShowUpload] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [type, setType] = useState<DocumentType>("OTHER");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    setError("");
    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("type", type);
      body.append("description", description);

      const res = await fetch(`/api/projects/${projectId}/documents`, {
        method: "POST",
        body,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Upload failed.");
        return;
      }

      setShowUpload(false);
      setDescription("");
      setType("OTHER");
      setFile(null);
      router.refresh();
    } catch {
      setError("Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(documentId: string) {
    const confirmed = window.confirm("Delete this document? This cannot be undone.");
    if (!confirmed) return;

    setError("");
    setDeletingId(documentId);
    try {
      const res = await fetch(`/api/projects/${projectId}/documents/${documentId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Delete failed.");
        return;
      }
      router.refresh();
    } catch {
      setError("Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Documents"
        description={`${docs.length} file${docs.length !== 1 ? "s" : ""}`}
        action={
          canUpload ? (
            <Button size="sm" className="w-full sm:w-auto" onClick={() => setShowUpload((v) => !v)}>
              <Upload className="h-4 w-4 mr-1.5" />
              Upload
            </Button>
          ) : undefined
        }
      />

      {showUpload && canUpload && (
        <form onSubmit={handleUpload} className="rounded-lg border border-border bg-card p-4 space-y-3 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-1.5 md:col-span-2">
              <p className="text-xs font-medium text-muted-foreground">File</p>
              <Input
                type="file"
                required
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Type</p>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as DocumentType)}
                className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="PLAN">Plan</option>
                <option value="PERMIT">Permit</option>
                <option value="CONTRACT">Contract</option>
                <option value="INSPECTION">Inspection</option>
                <option value="PHOTO">Photo</option>
                <option value="OTHER">Other</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <p className="text-xs font-medium text-muted-foreground">Description (optional)</p>
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add context for this file"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button type="submit" size="sm" disabled={uploading || !file}>
              {uploading ? "Uploading..." : "Upload File"}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
        </form>
      )}

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
                {canUpload && <th className="w-12" />}
              </tr>
            </thead>
            <tbody>
              {docs.map((doc) => {
                const Icon = typeIconMap[doc.type] ?? File;
                return (
                  <tr key={doc.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-2.5 hover:underline"
                      >
                        <Icon className="h-4 w-4 text-primary shrink-0" />
                        <span className="font-medium text-foreground">{doc.name}</span>
                      </a>
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
                    <td className="px-4 py-3 text-muted-foreground">{formatDate(new Date(doc.createdAt))}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">
                      {doc.fileSize ? formatFileSize(doc.fileSize) : "—"}
                    </td>
                    {canUpload && (
                      <td className="px-2 py-3 text-right">
                        <button
                          type="button"
                          disabled={deletingId === doc.id}
                          onClick={() => handleDelete(doc.id)}
                          className="inline-flex items-center justify-center rounded-md p-1.5 text-muted-foreground hover:text-destructive disabled:opacity-50"
                          aria-label="Delete document"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    )}
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
