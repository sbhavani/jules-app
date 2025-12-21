"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanStep {
  title?: string;
  description?: string;
  [key: string]: unknown;
}

interface PlanContentProps {
  content: string | object;
}

export function PlanContent({ content }: PlanContentProps) {
  const [copied, setCopied] = useState(false);

  const getPlanText = (data: unknown): string => {
    if (Array.isArray(data)) {
      return data
        .map((item: PlanStep, index: number) => {
          const title = item.title
            ? `${index + 1}. ${item.title}`
            : `${index + 1}. ${JSON.stringify(item)}`;
          const desc = item.description
            ? `
   ${item.description}`
            : "";
          return title + desc;
        })
        .join("\n\n");
    }

    if (
      typeof data === "object" &&
      data !== null &&
      "steps" in data &&
      Array.isArray((data as Record<string, unknown>).steps)
    ) {
      const planData = data as { description?: string; steps: PlanStep[] };
      const steps = planData.steps
        .map((step: PlanStep, index: number) => {
          const title = step.title
            ? `Step ${index + 1}: ${step.title}`
            : `Step ${index + 1}: ${JSON.stringify(step)}`;
          const desc = step.description
            ? `
   ${step.description}`
            : "";
          return title + desc;
        })
        .join("\n\n");
      return planData.description
        ? `${planData.description}\n\n${steps}`
        : steps;
    }

    return JSON.stringify(data, null, 2);
  };

  const handleCopy = async () => {
    try {
      let data = content;
      if (typeof content === "string") {
        try {
          data = JSON.parse(content);
        } catch {
          data = content;
        }
      }

      const text = typeof data === "string" ? data : getPlanText(data);

      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        textArea.style.top = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
        } catch (err) {
          console.error("Fallback: Oops, unable to copy", err);
          throw err;
        }
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy plan:", err);
    }
  };

  const parsed = typeof content === "string" ? JSON.parse(content) : content;

  return (
    <div className="relative group">
      <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleCopy}
          className="h-6 w-6 bg-zinc-900/80 hover:bg-zinc-800 text-white/60 hover:text-white"
          title="Copy plan details"
          aria-label={copied ? "Copied!" : "Copy plan details"}
        >
          {copied ? (
            <Check className="h-3 w-3 text-green-500" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
        </Button>
      </div>

      {Array.isArray(parsed) && (
        <div className="space-y-2 pr-6">
          {parsed.map((item: PlanStep, index: number) => (
            <div key={index} className="pl-3 border-l-2 border-primary/30">
              {item.title && (
                <div className="font-medium text-xs">{item.title}</div>
              )}
              {item.description && (
                <div className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
                  {item.description}
                </div>
              )}
              {!item.title && !item.description && (
                <div className="text-xs">
                  {typeof item === "string" ? item : JSON.stringify(item)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {parsed.steps && Array.isArray(parsed.steps) && (
        <div className="space-y-2 pr-6">
          {parsed.description && (
            <div className="mb-2 text-xs">{parsed.description}</div>
          )}
          {parsed.steps.map((step: PlanStep, index: number) => (
            <div key={index} className="pl-3 border-l-2 border-primary/30">
              <div className="font-medium text-xs">
                Step {index + 1}:{" "}
                {step.title ||
                  (typeof step === "string" ? step : JSON.stringify(step))}
              </div>
              {step.description && (
                <div className="text-muted-foreground text-[11px] mt-0.5 leading-relaxed">
                  {step.description}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
