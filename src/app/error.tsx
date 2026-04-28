"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="text-center space-y-4 max-w-sm px-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 mx-auto">
          <AlertTriangle className="h-7 w-7 text-red-600" />
        </div>
        <div>
          <h1 className="text-lg font-semibold text-foreground">Something went wrong</h1>
          <p className="text-sm text-muted-foreground mt-1">
            An unexpected error occurred. Try refreshing the page.
          </p>
        </div>
        <Button onClick={reset} size="sm">Try again</Button>
      </div>
    </div>
  );
}
