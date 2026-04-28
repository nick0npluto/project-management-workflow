"use client";

import { Bell, Search, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { Sidebar } from "@/components/layout/sidebar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

interface TopbarProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function Topbar({ title, subtitle, action }: TopbarProps) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-4 border-b border-border bg-card px-4 md:px-6">
      {/* Mobile menu trigger */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden text-muted-foreground">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64 bg-sidebar border-sidebar-border">
          <Sidebar onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <div className="flex-1 min-w-0">
        <h1 className="text-base font-semibold text-foreground leading-none">{title}</h1>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5 hidden sm:block">{subtitle}</p>}
      </div>

      {action && <div className="hidden sm:block">{action}</div>}

      <div className="hidden lg:flex items-center gap-2">
        <div className="relative w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search projects..."
            className="pl-9 h-9 bg-muted/50 border-transparent focus-visible:bg-card"
          />
        </div>
      </div>

      <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
        <Bell className="h-5 w-5" />
        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-500" />
      </Button>
    </header>
  );
}
