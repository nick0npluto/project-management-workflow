import { Topbar } from "@/components/layout/topbar";
import { Construction } from "lucide-react";

export default function ReportsPage() {
  return (
    <div className="flex flex-col flex-1">
      <Topbar title="Reports" subtitle="Project analytics and summaries" />
      <main className="flex flex-1 items-center justify-center">
        <div className="text-center text-muted-foreground space-y-2">
          <Construction className="h-10 w-10 mx-auto opacity-40" />
          <p className="text-sm font-medium">Reports — coming in next phase</p>
        </div>
      </main>
    </div>
  );
}
