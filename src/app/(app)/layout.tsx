import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { createClient } from "@/lib/supabase/server";
import { prisma } from "@/lib/prisma";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user: authUser } } = await supabase.auth.getUser();

  let appUser = null;
  if (authUser) {
    appUser = await prisma.user.findUnique({
      where: { supabaseId: authUser.id },
      select: { fullName: true, role: true, title: true },
    });
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-sidebar-border z-50">
        <Sidebar user={appUser} />
      </aside>

      <div className="flex flex-1 flex-col md:pl-64 pb-16 md:pb-0 min-w-0">
        {children}
      </div>

      <MobileNav />
    </div>
  );
}
