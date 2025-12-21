"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DiffViewer } from "@/components/ui/diff-viewer";
import type { Activity } from "@/types/jules";

interface CodeDiffSidebarProps {
  activities: Activity[];
  repoUrl?: string;
}

export function CodeDiffSidebar({ activities, repoUrl }: CodeDiffSidebarProps) {
  // Get only the final diff (last activity with a diff)
  const finalDiff = activities.filter((activity) => activity.diff).slice(-1);

  if (finalDiff.length === 0) {
    return (
      <div className="flex items-center justify-center h-full p-6">
        <p className="text-xs text-muted-foreground text-center leading-relaxed">
          No code changes yet.
        </p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4">
        {finalDiff.map((activity) => (
          <DiffViewer
            key={activity.id}
            diff={activity.diff!}
            repoUrl={repoUrl}
            branch="main"
          />
        ))}
      </div>
    </ScrollArea>
  );
}
