import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar — fixed left column */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r border-sidebar-border z-50">
        <Sidebar />
      </aside>

      {/* Main content — offset by sidebar width on desktop */}
      <div className="flex flex-1 flex-col md:pl-64 pb-16 md:pb-0 min-w-0">
        {children}
      </div>

      {/* Mobile bottom nav */}
      <MobileNav />
    </div>
  );
}
