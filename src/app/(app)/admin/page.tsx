import { Topbar } from "@/components/layout/topbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { UserTable } from "@/components/admin/user-table";

const roleLabel: Record<string, string> = {
  EXECUTIVE: "Executive",
  PROJECT_MANAGER: "Project Manager",
  FIELD_SUPERVISOR: "Field Supervisor",
  ADMIN: "Admin",
};

export default async function AdminPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    include: {
      _count: { select: { memberships: true } },
    },
  });

  const roleCounts: Record<string, number> = {};
  for (const u of users) {
    roleCounts[u.role] = (roleCounts[u.role] ?? 0) + 1;
  }

  const serialized = users.map((u) => ({
    id: u.id,
    fullName: u.fullName,
    email: u.email,
    role: u.role,
    title: u.title,
    phone: u.phone,
    projectCount: u._count.memberships,
    createdAt: u.createdAt.toISOString(),
  }));

  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Admin" subtitle="User management" />

      <main className="flex-1 p-4 md:p-6 space-y-6 max-w-5xl">
        {/* Role breakdown */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {(["EXECUTIVE", "PROJECT_MANAGER", "FIELD_SUPERVISOR", "ADMIN"] as const).map((role) => (
            <Card key={role} className="shadow-sm">
              <CardContent className="p-4">
                <p className="text-2xl font-bold text-foreground">{roleCounts[role] ?? 0}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{roleLabel[role]}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* User table */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              All Users — {users.length} total
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <UserTable users={serialized} />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
