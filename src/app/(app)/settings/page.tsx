import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

const roleLabel: Record<string, string> = {
  EXECUTIVE:        "Executive",
  PROJECT_MANAGER:  "Project Manager",
  FIELD_SUPERVISOR: "Field Supervisor",
  ADMIN:            "Admin / Accounting",
};

const roleBadge: Record<string, string> = {
  EXECUTIVE:        "bg-purple-50 text-purple-700 border-purple-100",
  PROJECT_MANAGER:  "bg-blue-50 text-blue-700 border-blue-100",
  FIELD_SUPERVISOR: "bg-amber-50 text-amber-700 border-amber-100",
  ADMIN:            "bg-slate-50 text-slate-700 border-slate-200",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  const user = authUser
    ? await prisma.user.findUnique({
        where: { supabaseId: authUser.id },
        select: { fullName: true, email: true, role: true, title: true, phone: true, createdAt: true },
      })
    : null;

  const initials = user
    ? user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Settings" subtitle="Account and preferences" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-2xl">
        {/* Profile */}
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shrink-0">
                {initials}
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{user?.fullName ?? "—"}</p>
                <p className="text-sm text-muted-foreground">{user?.email ?? "—"}</p>
                {user && (
                  <span className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge[user.role] ?? ""}`}>
                    {roleLabel[user.role] ?? user.role}
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Title</p>
                <p className="font-medium text-foreground">{user?.title ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Phone</p>
                <p className="font-medium text-foreground font-mono">{user?.phone ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Email</p>
                <p className="font-medium text-foreground">{user?.email ?? "—"}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Member since</p>
                <p className="font-medium text-foreground">
                  {user?.createdAt
                    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "long", year: "numeric" })
                    : "—"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demo notice */}
        <Card className="shadow-sm border-amber-200 bg-amber-50/50">
          <CardContent className="p-4">
            <p className="text-sm font-medium text-amber-800 mb-1">Demo Account</p>
            <p className="text-xs text-amber-700 leading-relaxed">
              This is a seeded demo account for Cornerstone Construction. Profile editing, password changes, and notification preferences are available in the production build.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
