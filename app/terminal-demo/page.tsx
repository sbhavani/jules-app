"use client";

import { IntegratedTerminal } from "@/components/integrated-terminal";

export default function TerminalDemo() {
  return (
    <div className="flex flex-col h-screen bg-gray-950">
      <div className="p-4 border-b border-gray-800">
        <h1 className="text-2xl font-bold text-white">
          Jules Integrated Terminal Demo
        </h1>
        <p className="text-gray-400 mt-1">
          Real-time web-based terminal with local machine access
        </p>
      </div>
      <div className="flex-1 p-4">
        <div className="h-full border border-gray-800 rounded-lg overflow-hidden">
          <IntegratedTerminal
            sessionId="demo-session"
            workingDir=""
            className="h-full"
          />
        </div>
      </div>
    </div>
  );
}
