import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HardHat } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary mx-auto">
          <HardHat className="h-7 w-7 text-primary-foreground" />
        </div>
        <div>
          <p className="text-5xl font-bold text-foreground">404</p>
          <h1 className="text-lg font-semibold text-foreground mt-1">Page not found</h1>
          <p className="text-sm text-muted-foreground mt-1">
            This page doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
        <Button asChild size="sm">
          <Link href="/dashboard">Back to Dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
