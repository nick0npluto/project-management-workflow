"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, ChevronRight, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionHeader } from "@/components/project/section-header";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

interface RFI {
  id: string;
  rfiNumber: number;
  title: string;
  description: string;
  status: "OPEN" | "IN_REVIEW" | "ANSWERED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate: string | null;
  answeredAt: string | null;
  answer: string | null;
  createdAt: string;
  updatedAt: string;
  submittedBy: { id: string; fullName: string };
  assignedTo: { id: string; fullName: string } | null;
}

interface AppUser {
  id: string;
  role: "EXECUTIVE" | "PROJECT_MANAGER" | "FIELD_SUPERVISOR" | "ADMIN";
  fullName: string;
}

interface ProjectUser {
  id: string;
  fullName: string;
  role: string;
}

function getDueState(dueDate: string | null) {
  if (!dueDate) return null;

  const due = new Date(dueDate);
  const now = new Date();
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return "OVERDUE";
  if (diffDays <= 2) return "DUE_SOON";
  return null;
}

export function RFIsClient({
  projectId,
  rfis,
  currentUser,
  projectUsers,
}: {
  projectId: string;
  rfis: RFI[];
  currentUser: AppUser | null;
  projectUsers: ProjectUser[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<RFI[]>(rfis);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showNewForm, setShowNewForm] = useState(false);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newPriority, setNewPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [newDueDate, setNewDueDate] = useState("");
  const [newAssignedToId, setNewAssignedToId] = useState(projectUsers[0]?.id ?? "");

  const [assignToId, setAssignToId] = useState("");
  const [assignDueDate, setAssignDueDate] = useState("");
  const [answerDraft, setAnswerDraft] = useState("");

  const selected = items.find((r) => r.id === selectedId) ?? null;
  const openCount = items.filter((r) => r.status === "OPEN").length;
  const inReviewCount = items.filter((r) => r.status === "IN_REVIEW").length;

  const role = currentUser?.role ?? null;
  const canCreate = role === "FIELD_SUPERVISOR" || role === "PROJECT_MANAGER";
  const canAssign = role === "PROJECT_MANAGER";
  const canAnswer = role === "PROJECT_MANAGER";
  const canClose = role === "PROJECT_MANAGER";

  function syncSelectedState(rfi: RFI | null) {
    if (!rfi) return;
    setAssignToId(rfi.assignedTo?.id ?? "");
    setAssignDueDate(rfi.dueDate ? rfi.dueDate.slice(0, 10) : "");
    setAnswerDraft(rfi.answer ?? "");
  }

  async function createRfi() {
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/rfis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          title: newTitle,
          description: newDescription,
          priority: newPriority,
          dueDate: newDueDate || null,
          assignedToId: canAssign ? newAssignedToId || null : null,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create RFI.");
        return;
      }

      setItems((prev) => [...prev, data]);
      setShowNewForm(false);
      setNewTitle("");
      setNewDescription("");
      setNewPriority("MEDIUM");
      setNewDueDate("");
      setSelectedId(data.id);
      syncSelectedState(data);
      router.refresh();
    } catch {
      setError("Failed to create RFI.");
    } finally {
      setSubmitting(false);
    }
  }

  async function updateRfi(
    action: "assign" | "answer" | "close",
    payload: Record<string, unknown>
  ) {
    if (!selected) return;
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/rfis/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to update RFI.");
        return;
      }

      setItems((prev) => prev.map((r) => (r.id === data.id ? data : r)));
      setSelectedId(data.id);
      syncSelectedState(data);
      router.refresh();
    } catch {
      setError("Failed to update RFI.");
    } finally {
      setSubmitting(false);
    }
  }

  async function deleteRfi() {
    if (!selected) return;
    const confirmed = window.confirm("Delete this RFI? This action cannot be undone.");
    if (!confirmed) return;

    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/rfis/${selected.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to delete RFI.");
        return;
      }
      setItems((prev) => prev.filter((r) => r.id !== selected.id));
      setSelectedId(null);
      router.refresh();
    } catch {
      setError("Failed to delete RFI.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4 min-w-0">
      <div className="flex-1 space-y-4 min-w-0">
        <SectionHeader
          title="Requests for Information"
          description={`${openCount} open · ${inReviewCount} in review · ${items.length} total`}
          action={
            canCreate ? (
              <Button size="sm" className="w-full sm:w-auto" onClick={() => setShowNewForm((prev) => !prev)}>
                <Plus className="h-4 w-4 mr-1.5" />
                New RFI
              </Button>
            ) : undefined
          }
        />

        {showNewForm && canCreate && (
          <Card className="shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Title</p>
                  <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <p className="text-xs font-medium text-muted-foreground">Description</p>
                  <textarea
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Priority</p>
                  <select
                    value={newPriority}
                    onChange={(e) => setNewPriority(e.target.value as typeof newPriority)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                  <Input type="date" value={newDueDate} onChange={(e) => setNewDueDate(e.target.value)} />
                </div>
                {canAssign && (
                  <div className="space-y-1.5 md:col-span-2">
                    <p className="text-xs font-medium text-muted-foreground">Assign To</p>
                    <select
                      value={newAssignedToId}
                      onChange={(e) => setNewAssignedToId(e.target.value)}
                      className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {projectUsers.map((user) => (
                        <option key={user.id} value={user.id}>
                          {user.fullName}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  disabled={submitting || !newTitle.trim() || !newDescription.trim()}
                  onClick={createRfi}
                >
                  {submitting ? "Saving..." : "Create RFI"}
                </Button>
                <Button variant="ghost" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
            <p className="text-sm">No RFIs on this project.</p>
          </div>
        ) : (
          <div className="rounded-lg border border-border overflow-hidden bg-card shadow-sm overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-14">#</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-[34%]">Title</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-24">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28 hidden md:table-cell">
                    Submitted By
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28 hidden md:table-cell">
                    Due Date
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground w-28 hidden md:table-cell">
                    SLA
                  </th>
                  <th className="w-8" />
                </tr>
              </thead>
              <tbody>
                {items.map((rfi) => (
                  <tr
                    key={rfi.id}
                    className={`h-12 border-b border-border last:border-0 cursor-pointer transition-colors hover:bg-muted/40 ${
                      selectedId === rfi.id ? "bg-primary/5" : ""
                    }`}
                    onClick={() => {
                      setSelectedId(rfi.id);
                      syncSelectedState(rfi);
                    }}
                  >
                    <td className="px-4 py-2 align-middle font-mono text-muted-foreground">
                      {String(rfi.rfiNumber).padStart(3, "0")}
                    </td>
                    <td className="px-4 py-2 align-middle font-medium text-foreground">
                      <span className="block truncate" title={rfi.title}>
                        {rfi.title}
                      </span>
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <StatusBadge type="rfi" value={rfi.status} />
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <StatusBadge type="priority" value={rfi.priority} />
                    </td>
                    <td className="px-4 py-2 align-middle text-muted-foreground hidden md:table-cell">
                      {rfi.submittedBy.fullName}
                    </td>
                    <td className="px-4 py-2 align-middle text-muted-foreground hidden md:table-cell">
                      {rfi.dueDate ? formatDate(new Date(rfi.dueDate)) : "—"}
                    </td>
                    <td className="px-4 py-2 align-middle hidden md:table-cell">
                      {getDueState(rfi.dueDate) === "OVERDUE" ? (
                        <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">
                          Overdue
                        </span>
                      ) : getDueState(rfi.dueDate) === "DUE_SOON" ? (
                        <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">
                          Due Soon
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 align-middle">
                      <ChevronRight
                        className={`h-4 w-4 text-muted-foreground transition-transform ${
                          selectedId === rfi.id ? "rotate-90" : ""
                        }`}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {error && <p className="text-sm text-destructive">{error}</p>}
        {role === "EXECUTIVE" && (
          <p className="text-sm text-muted-foreground">
            Executive view is read-only. Project managers can route and close RFIs.
          </p>
        )}
      </div>

      <Dialog open={selected != null} onOpenChange={(open) => !open && setSelectedId(null)}>
        {selected && (
          <DialogContent className="w-[96vw] sm:w-[94vw] lg:w-[90vw] max-w-[1200px] h-[72vh] max-h-[720px] overflow-hidden backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-left">
                <span className="block text-xs font-mono text-muted-foreground mb-1">
                  RFI-{String(selected.rfiNumber).padStart(3, "0")}
                </span>
                <span className="text-base font-semibold text-foreground leading-snug">{selected.title}</span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 overflow-y-auto pr-1">
              {canCreate && (
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={submitting}
                    onClick={deleteRfi}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-1.5" />
                    Delete RFI
                  </Button>
                </div>
              )}

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
                  <span className="text-foreground font-medium">
                    {selected.dueDate ? formatDate(new Date(selected.dueDate)) : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Updated</span>
                  <span className="text-foreground font-medium">{formatDate(new Date(selected.updatedAt))}</span>
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
                    <p className="text-xs text-emerald-600 mt-1.5">{formatDate(new Date(selected.answeredAt))}</p>
                  )}
                </div>
              )}

              {canAssign && (selected.status === "OPEN" || selected.status === "IN_REVIEW") && (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Assignment</p>
                  <select
                    value={assignToId}
                    onChange={(e) => setAssignToId(e.target.value)}
                    className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="" disabled>
                      Select assignee
                    </option>
                    {projectUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.fullName}
                      </option>
                    ))}
                  </select>
                  <Input
                    type="date"
                    value={assignDueDate}
                    onChange={(e) => setAssignDueDate(e.target.value)}
                  />
                  <Button
                    size="sm"
                    disabled={submitting || !assignToId}
                    onClick={() =>
                      updateRfi("assign", { assignedToId: assignToId || null, dueDate: assignDueDate || null })
                    }
                  >
                    {submitting ? "Saving..." : "Update Assignment"}
                  </Button>
                </div>
              )}

              {canAnswer && selected.status === "IN_REVIEW" && (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-xs font-medium text-muted-foreground">Response</p>
                  <textarea
                    rows={3}
                    value={answerDraft}
                    onChange={(e) => setAnswerDraft(e.target.value)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  />
                  <Button
                    size="sm"
                    disabled={submitting || !answerDraft.trim()}
                    onClick={() => updateRfi("answer", { answer: answerDraft })}
                  >
                    {submitting ? "Saving..." : "Save Response"}
                  </Button>
                </div>
              )}

              {canClose && selected.status === "ANSWERED" && (
                <div className="border-t border-border pt-3">
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={submitting}
                    onClick={() => updateRfi("close", {})}
                  >
                    {submitting ? "Closing..." : "Close RFI"}
                  </Button>
                </div>
              )}

              {canAssign && selected.status !== "CLOSED" && (
                <div className="space-y-2 border-t border-border pt-3">
                  <p className="text-xs text-muted-foreground">
                    Workflow: OPEN → IN_REVIEW (assign) → ANSWERED (save response) → CLOSED.
                  </p>
                </div>
              )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
