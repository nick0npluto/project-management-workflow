"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, AlertCircle, XCircle, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/shared/status-badge";
import { formatDate } from "@/lib/utils";

type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
type TaskPriority = "LOW" | "MEDIUM" | "HIGH";

interface TaskRow {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  assignedTo: { fullName: string } | null;
}

interface ProjectUser {
  id: string;
  fullName: string;
}

const taskIconMap = {
  DONE: CheckCircle2,
  IN_PROGRESS: Clock,
  BLOCKED: XCircle,
  TODO: AlertCircle,
};
const taskColorMap = {
  DONE: "text-emerald-600",
  IN_PROGRESS: "text-blue-600",
  BLOCKED: "text-red-600",
  TODO: "text-slate-400",
};

export function TasksPanelClient({
  projectId,
  initialTasks,
  assignees,
  canCreate,
}: {
  projectId: string;
  initialTasks: TaskRow[];
  assignees: ProjectUser[];
  canCreate: boolean;
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskRow[]>(initialTasks);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("MEDIUM");
  const [dueDate, setDueDate] = useState("");
  const [assignedToId, setAssignedToId] = useState(assignees[0]?.id ?? "");

  const openTasks = tasks.filter((task) => task.status !== "DONE");

  async function handleCreateTask() {
    if (!title.trim()) return;
    setError("");
    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${projectId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          priority,
          dueDate: dueDate || null,
          assignedToId: assignedToId || null,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Failed to create task.");
        return;
      }

      setTasks((prev) => [...prev, data]);
      setTitle("");
      setPriority("MEDIUM");
      setDueDate("");
      setShowForm(false);
      router.refresh();
    } catch {
      setError("Failed to create task.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Open Tasks
          </CardTitle>
          {canCreate && (
            <Button size="sm" variant="secondary" onClick={() => setShowForm((v) => !v)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Add Task
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {showForm && canCreate && (
          <div className="rounded-lg border border-border p-3 space-y-3 bg-muted/20">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1.5 md:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Task Name</p>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Confirm framing inspection date"
                />
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Priority</p>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs font-medium text-muted-foreground">Due Date</p>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
              <div className="space-y-1.5 md:col-span-2">
                <p className="text-xs font-medium text-muted-foreground">Assigned To</p>
                <select
                  value={assignedToId}
                  onChange={(e) => setAssignedToId(e.target.value)}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Unassigned</option>
                  {assignees.map((assignee) => (
                    <option key={assignee.id} value={assignee.id}>
                      {assignee.fullName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button size="sm" onClick={handleCreateTask} disabled={submitting || !title.trim()}>
                {submitting ? "Adding..." : "Create Task"}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                Cancel
              </Button>
            </div>
          </div>
        )}

        {openTasks.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">All tasks complete.</p>
        ) : (
          openTasks.map((task) => {
            const Icon = taskIconMap[task.status];
            const color = taskColorMap[task.status];
            return (
              <div key={task.id} className="flex items-start gap-3 py-2 border-b border-border last:border-0">
                <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{task.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <StatusBadge type="task" value={task.status} />
                    <StatusBadge type="priority" value={task.priority} />
                    {task.dueDate && (
                      <span className="text-xs text-muted-foreground">Due {formatDate(new Date(task.dueDate))}</span>
                    )}
                  </div>
                </div>
                {task.assignedTo && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-bold shrink-0">
                    {task.assignedTo.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                )}
              </div>
            );
          })
        )}
        {error && <p className="text-sm text-destructive">{error}</p>}
      </CardContent>
    </Card>
  );
}
