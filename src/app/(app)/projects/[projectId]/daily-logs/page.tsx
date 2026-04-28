"use client";

import { useState } from "react";
import { CloudSun, Users, Clock, AlertCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatDate, formatDateShort } from "@/lib/utils";
import { mockRiversideLogs } from "@/lib/mock-data";

export default function DailyLogsPage({ params }: { params: { projectId: string } }) {
  const logs = params.projectId === "proj-001" ? mockRiversideLogs : [];
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-semibold text-foreground">Daily Logs</h2>
          <p className="text-sm text-muted-foreground">{logs.length} log{logs.length !== 1 ? "s" : ""} submitted</p>
        </div>
        <Button size="sm" onClick={() => setShowForm(true)}>
          <Plus className="h-4 w-4 mr-1.5" />
          Submit Log
        </Button>
      </div>

      {showForm && (
        <Card className="shadow-sm border-primary/30 bg-primary/5">
          <CardContent className="p-5 space-y-4">
            <h3 className="text-sm font-semibold text-foreground">New Daily Log</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Date</label>
                <input type="date" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" defaultValue="2026-04-28" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Weather</label>
                <input type="text" placeholder="e.g. Sunny, 92°F" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Crew Count</label>
                <input type="number" placeholder="0" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Hours Worked</label>
                <input type="number" step="0.5" placeholder="8.0" className="w-full h-9 rounded-md border border-input bg-background px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Work Performed</label>
                <textarea rows={3} placeholder="Describe work completed today..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Safety Notes</label>
                <textarea rows={2} placeholder="Any safety observations or incidents..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
              <div className="col-span-2 space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Issues / Blockers</label>
                <textarea rows={2} placeholder="Any blockers or items to flag..." className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none" />
              </div>
            </div>
            <div className="flex items-center gap-2 pt-1">
              <Button size="sm">Submit Log</Button>
              <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
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
                    <p className="font-semibold text-foreground">{formatDate(log.logDate)}</p>
                    <p className="text-xs text-muted-foreground">Submitted by {log.submittedBy.fullName}</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground shrink-0">
                    <span className="flex items-center gap-1">
                      <CloudSun className="h-3.5 w-3.5" />
                      {log.weatherConditions} {log.temperatureF ? `${log.temperatureF}°F` : ""}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" />
                      {log.crewCount} crew
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {log.hoursWorked}h
                    </span>
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
