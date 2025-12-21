"use client";

import { useJules } from "@/lib/jules/provider";
import { ApiKeySetup } from "@/components/api-key-setup";
import { AppLayout } from "@/components/app-layout";

export default function Home() {
  const { apiKey, isLoading } = useJules();

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <p className="text-sm font-mono text-muted-foreground animate-pulse">
          Initializing...
        </p>
      </div>
    );
  }

  if (!apiKey) {
    return <ApiKeySetup />;
  }

  return <AppLayout />;
}
