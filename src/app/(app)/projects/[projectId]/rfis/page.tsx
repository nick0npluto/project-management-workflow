"use client";

import { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/shared/status-badge";
import { mockRiversideRFIs } from "@/lib/mock-data";
import { formatDate } from "@/lib/utils";

export default function RFIsPage({ params }: { params: { projectId: string } }) {
  const rfis = params.projectId === "proj-001" ? mockRiversideRFIs : [];
  const [selected, setSelected] = useState<(typeof rfis)[0] | null>(null);

  return (
    <div className="flex gap-6">
      {/* RFI List */}
      <div className="flex-1 space-y-4 min-w-0">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-foreground">Requests for Information</h2>
            <p className="text-sm text-muted-foreground">
              {rfis.filter((r) => r.status === "OPEN" || r.status === "IN_REVIEW").length} open ·{" "}
              {rfis.length} total
            </p>
          </div>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-1.5" />
            New RFI
          </Button>
        </div>

        <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-14">#</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-24">Priority</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Submitted By</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Due Date</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {rfis.map((rfi, i) => (
                <tr
                  key={rfi.id}
                  className={`border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${
                    selected?.id === rfi.id ? "bg-primary/5" : ""
                  }`}
                  onClick={() => setSelected(selected?.id === rfi.id ? null : rfi)}
                >
                  <td className="px-4 py-3 font-mono text-muted-foreground">
                    {String(rfi.rfiNumber).padStart(3, "0")}
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{rfi.title}</td>
                  <td className="px-4 py-3">
                    <StatusBadge type="rfi" value={rfi.status} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge type="priority" value={rfi.priority} />
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{rfi.submittedBy.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{formatDate(rfi.dueDate)}</td>
                  <td className="px-4 py-3">
                    <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform ${selected?.id === rfi.id ? "rotate-90" : ""}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Panel */}
      {selected && (
        <div className="w-80 shrink-0">
          <Card className="shadow-sm sticky top-20">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs font-mono text-muted-foreground mb-1">
                    RFI-{String(selected.rfiNumber).padStart(3, "0")}
                  </p>
                  <h3 className="text-sm font-semibold text-foreground leading-snug">{selected.title}</h3>
                </div>
                <button onClick={() => setSelected(null)} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
              </div>

              <div className="flex items-center gap-2">
                <StatusBadge type="rfi" value={selected.status} />
                <StatusBadge type="priority" value={selected.priority} />
              </div>

              <div className="text-xs space-y-2 text-muted-foreground">
                <div className="flex justify-between">
                  <span>Submitted by</span>
                  <span className="text-foreground font-medium">{selected.submittedBy.fullName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Assigned to</span>
                  <span className="text-foreground font-medium">{selected.assignedTo?.fullName ?? "—"}</span>
                </div>
                <div className="flex justify-between">
                  <span>Due date</span>
                  <span className="text-foreground font-medium">{formatDate(selected.dueDate)}</span>
                </div>
              </div>

              <div>
                <p className="text-xs font-medium text-muted-foreground mb-1.5">Description</p>
                <p className="text-sm text-foreground/80 leading-relaxed">{selected.description}</p>
              </div>

              {selected.answer && (
                <div className="rounded-lg bg-emerald-50 border border-emerald-100 p-3">
                  <p className="text-xs font-medium text-emerald-700 mb-1.5">Response</p>
                  <p className="text-sm text-emerald-800 leading-relaxed">{selected.answer}</p>
                  {selected.answeredAt && (
                    <p className="text-xs text-emerald-600 mt-1.5">{formatDate(selected.answeredAt)}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
