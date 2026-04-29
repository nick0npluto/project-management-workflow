"use client";

const roleBadge: Record<string, string> = {
  EXECUTIVE:        "bg-purple-50 text-purple-700 border-purple-100",
  PROJECT_MANAGER:  "bg-blue-50 text-blue-700 border-blue-100",
  FIELD_SUPERVISOR: "bg-amber-50 text-amber-700 border-amber-100",
  ADMIN:            "bg-slate-50 text-slate-700 border-slate-200",
};

const roleLabel: Record<string, string> = {
  EXECUTIVE:        "Executive",
  PROJECT_MANAGER:  "Project Manager",
  FIELD_SUPERVISOR: "Field Supervisor",
  ADMIN:            "Admin",
};

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
  title: string | null;
  phone: string | null;
  projectCount: number;
}

export function UserTable({ users }: { users: User[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Name</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground">Email</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground w-36">Role</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden md:table-cell">Title</th>
            <th className="text-left px-5 py-3 text-xs font-medium text-muted-foreground hidden lg:table-cell">Phone</th>
            <th className="text-center px-5 py-3 text-xs font-medium text-muted-foreground w-20">Projects</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => {
            const initials = user.fullName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
            return (
              <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shrink-0">
                      {initials}
                    </div>
                    <span className="font-medium text-foreground">{user.fullName}</span>
                  </div>
                </td>
                <td className="px-5 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${roleBadge[user.role] ?? "bg-muted text-muted-foreground border-border"}`}>
                    {roleLabel[user.role] ?? user.role}
                  </span>
                </td>
                <td className="px-5 py-3 text-muted-foreground hidden md:table-cell">
                  {user.title ?? "—"}
                </td>
                <td className="px-5 py-3 text-muted-foreground hidden lg:table-cell font-mono text-xs">
                  {user.phone ?? "—"}
                </td>
                <td className="px-5 py-3 text-center text-muted-foreground">
                  {user.projectCount}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
