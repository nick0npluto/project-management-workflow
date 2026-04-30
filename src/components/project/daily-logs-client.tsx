"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CloudSun, Users, Clock, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SectionHeader } from "@/components/project/section-header";
import { formatDate } from "@/lib/utils";

interface Log {
  id: string;
  logDate: string;
  weatherConditions: string | null;
  temperatureF: number | null;
  workPerformed: string;
  crewCount: number | null;
  hoursWorked: number | null;
  safetyNotes: string | null;
  issues: string | null;
  submittedBy: { fullName: string };
}

export function DailyLogsClient({ projectId, logs }: { projectId: string; logs: Log[] }) {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    logDate: new Date().toISOString().split("T")[0],
    weatherConditions: "",
    temperatureF: "",
    crewCount: "",
    hoursWorked: "",
    workPerformed: "",
    safetyNotes: "",
    issues: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/daily-logs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId,
          logDate: form.logDate,
          weatherConditions: form.weatherConditions || null,
          temperatureF: form.temperatureF ? parseInt(form.temperatureF) : null,
          crewCount: form.crewCount ? parseInt(form.crewCount) : null,
          hoursWorked: form.hoursWorked ? parseFloat(form.hoursWorked) : null,
          workPerformed: form.workPerformed,
          safetyNotes: form.safetyNotes || null,
          issues: form.issues || null,
        }),
      });
      if (res.ok) {
        setShowForm(false);
        setForm({
          logDate: new Date().toISOString().split("T")[0],
          weatherConditions: "",
          temperatureF: "",
          crewCount: "",
          hoursWorked: "",
          workPerformed: "",
          safetyNotes: "",
          issues: "",
        });
        router.refresh();
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-4">
      <SectionHeader
        title="Daily Logs"
        description={`${logs.length} log${logs.length !== 1 ? "s" : ""} submitted`}
        action={
          <Button size="sm" className="w-full sm:w-auto" onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Submit Log
          </Button>
        }
      />

      {showForm && (
        <Card className="shadow-sm border-primary/30 bg-primary/5">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">New Daily Log</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date *</label>
                <input
                  type="date"
                  required
                  value={form.logDate}
                  onChange={(e) => setForm({ ...form, logDate: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Weather</label>
                <input
                  type="text"
                  placeholder="e.g. Sunny"
                  value={form.weatherConditions}
                  onChange={(e) => setForm({ ...form, weatherConditions: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Crew Count</label>
                <input
                  type="number"
                  placeholder="0"
                  value={form.crewCount}
                  onChange={(e) => setForm({ ...form, crewCount: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Hours Worked</label>
                <input
                  type="number"
                  step="0.5"
                  placeholder="8.0"
                  value={form.hoursWorked}
                  onChange={(e) => setForm({ ...form, hoursWorked: e.target.value })}
                  className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Work Performed *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Describe work completed today..."
                  value={form.workPerformed}
                  onChange={(e) => setForm({ ...form, workPerformed: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Safety Notes</label>
                <textarea
                  rows={2}
                  placeholder="Any safety observations or incidents..."
                  value={form.safetyNotes}
                  onChange={(e) => setForm({ ...form, safetyNotes: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Issues / Blockers</label>
                <textarea
                  rows={2}
                  placeholder="Any blockers or items to flag..."
                  value={form.issues}
                  onChange={(e) => setForm({ ...form, issues: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>
              <div className="col-span-2 flex items-center gap-2 pt-1">
                <Button type="submit" size="sm" disabled={submitting}>
                  {submitting ? "Submitting..." : "Submit Log"}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
          <p className="text-sm">No daily logs yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id} className="shadow-sm">
              <CardContent className="p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{formatDate(new Date(log.logDate))}</p>
                    <p className="text-xs text-muted-foreground">Submitted by {log.submittedBy.fullName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    {(log.weatherConditions || log.temperatureF) && (
                      <span className="flex items-center gap-1">
                        <CloudSun className="h-3.5 w-3.5" />
                        {log.weatherConditions} {log.temperatureF ? `${log.temperatureF}°F` : ""}
                      </span>
                    )}
                    {log.crewCount != null && (
                      <span className="flex items-center gap-1">
                        <Users className="h-3.5 w-3.5" />
                        {log.crewCount} crew
                      </span>
                    )}
                    {log.hoursWorked != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {log.hoursWorked}h
                      </span>
                    )}
                  </div>
                </div>

                <p className="text-sm text-foreground/90 leading-relaxed">{log.workPerformed}</p>

                {log.safetyNotes && (
                  <div className="mt-3 rounded-md bg-emerald-50 border border-emerald-100 px-3 py-2 text-xs text-emerald-700">
                    <span className="font-medium">Safety: </span>{log.safetyNotes}
                  </div>
                )}
                {log.issues && (
                  <div className="mt-2 rounded-md bg-orange-50 border border-orange-100 px-3 py-2 text-xs text-orange-700 flex items-start gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                    <span>{log.issues}</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
