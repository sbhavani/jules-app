"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useJules } from "@/lib/jules/provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Eye, EyeOff } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface ApiKeySetupFormProps {
  onSuccess?: () => void;
}

export function ApiKeySetupForm({ onSuccess }: ApiKeySetupFormProps) {
  const { setApiKey } = useJules();
  const [key, setKey] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      setIsSaving(true);
      // Simulate a small delay for the animation to be perceived
      await new Promise((resolve) => setTimeout(resolve, 600));
      setApiKey(key.trim());
      onSuccess?.();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label
          htmlFor="api-key"
          className="text-xs font-bold uppercase tracking-widest text-white/40"
        >
          API Key <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <Input
            id="api-key"
            type={showKey ? "text" : "password"}
            placeholder="Your Jules API key"
            value={key}
            onChange={(e) => setKey(e.target.value)}
            className="w-full bg-black/50 border-white/10 pr-10"
            required
          />
          <button
            type="button"
            onClick={() => setShowKey(!showKey)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
            aria-label={showKey ? "Hide API key" : "Show API key"}
          >
            {showKey ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        <p className="text-[10px] text-muted-foreground font-mono">
          e.g., sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
        </p>
        <p className="text-xs text-muted-foreground">
          Your API key is stored locally in your browser and never sent to any
          server except Jules API.
        </p>
      </div>
      <Button
        type="submit"
        className="w-full relative overflow-hidden font-mono uppercase tracking-widest text-xs"
        disabled={!key.trim() || isSaving}
      >
        <AnimatePresence mode="wait" initial={false}>
          {isSaving ? (
            <motion.span
              key="saving"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              Saving...
            </motion.span>
          ) : (
            <motion.span
              key="save"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
            >
              Save your key
            </motion.span>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}

export function ApiKeySetup() {
  return (
    <div className="flex min-h-screen items-center justify-center p-2 sm:p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Hey there! Let&apos;s get Jules setup.</CardTitle>
          <CardDescription>
            Enter your Jules API key to get started. Get your key from the{" "}
            <a
              href="https://jules.google.com/settings"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary underline hover:no-underline"
            >
              Jules web app settings
            </a>
            .
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ApiKeySetupForm />

          <div className="mt-6 rounded-lg bg-muted p-4 text-sm">
            <h4 className="font-semibold mb-2">Getting Started</h4>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>
                Visit{" "}
                <a
                  href="https://jules.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary underline"
                >
                  jules.google.com
                </a>
              </li>
              <li>Connect a GitHub repository</li>
              <li>Go to Settings and create an API key</li>
              <li>Paste your API key above</li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
