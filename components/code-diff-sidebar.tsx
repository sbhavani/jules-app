"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { DiffViewer } from "@/components/ui/diff-viewer";
import type { Activity } from "@/types/jules";
import { FileCode } from "lucide-react";

interface CodeDiffSidebarProps {
  activities: Activity[];
  repoUrl?: string;
}

export function CodeDiffSidebar({ activities, repoUrl }: CodeDiffSidebarProps) {
  // Get only the final diff (last activity with a diff)
  const finalDiff = activities.filter((activity) => activity.diff).slice(-1);

  if (finalDiff.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center">
          <FileCode className="h-6 w-6 text-white/20" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-white/40 uppercase tracking-widest">
            No Changes
          </h3>
          <p className="text-[11px] text-white/30 font-mono leading-relaxed">
            Code modifications will appear here once Jules makes changes.
          </p>
        </div>
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
