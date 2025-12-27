"use client";

import { useState, useMemo, useId } from "react";
import {
  Check,
  Copy,
  ChevronDown,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface DiffViewerProps {
  diff: string;
  className?: string;
  repoUrl?: string;
  branch?: string;
}

interface ParsedDiffFile {
  filename: string;
  lines: DiffLine[];
}

interface DiffLine {
  type: "add" | "remove" | "context" | "header";
  content: string;
  originalLineNumber?: number;
  modifiedLineNumber?: number;
}

function parseDiff(diff: string): ParsedDiffFile[] {
  const files: ParsedDiffFile[] = [];
  const lines = diff.split("\n");
  let currentFile: ParsedDiffFile | null = null;
  let originalLine = 0;
  let modifiedLine = 0;

  for (const line of lines) {
    // File header: diff --git a/file b/file
    if (line.startsWith("diff --git")) {
      if (currentFile) {
        files.push(currentFile);
      }
      const match = line.match(/b\/(.+)$/);
      currentFile = {
        filename: match ? match[1] : "unknown",
        lines: [],
      };
      originalLine = 0;
      modifiedLine = 0;
    } else if (currentFile) {
      // Skip metadata lines
      if (
        line.startsWith("index ") ||
        line.startsWith("---") ||
        line.startsWith("+++")
      ) {
        continue;
      }
      // Chunk header: @@ -1,5 +1,5 @@
      else if (line.startsWith("@@")) {
        const match = line.match(/^@@ -(\d+),?\d* \+(\d+),?\d* @@/);
        if (match) {
          originalLine = parseInt(match[1], 10) - 1;
          modifiedLine = parseInt(match[2], 10) - 1;
        }
        currentFile.lines.push({
          type: "header",
          content: line,
        });
      }
      // Added line
      else if (line.startsWith("+")) {
        modifiedLine++;
        currentFile.lines.push({
          type: "add",
          content: line,
          modifiedLineNumber: modifiedLine,
        });
      }
      // Removed line
      else if (line.startsWith("-")) {
        originalLine++;
        currentFile.lines.push({
          type: "remove",
          content: line,
          originalLineNumber: originalLine,
        });
      }
      // Context line
      else if (line.startsWith(" ")) {
        originalLine++;
        modifiedLine++;
        currentFile.lines.push({
          type: "context",
          content: line,
          originalLineNumber: originalLine,
          modifiedLineNumber: modifiedLine,
        });
      }
    }
  }

  if (currentFile) {
    files.push(currentFile);
  }

  return files;
}

function FileDiff({
  file,
  repoUrl,
  branch = "main",
}: {
  file: ParsedDiffFile;
  repoUrl?: string;
  branch?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copyState, setCopyState] = useState<"idle" | "copied" | "error">(
    "idle",
  );
  const contentId = useId();

  const handleCopy = async () => {
    const diffText = file.lines.map((line) => line.content).join("\n");

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(diffText);
        setCopyState("copied");
      } else {
        // Fallback for environments where Clipboard API is not available
        const textArea = document.createElement("textarea");
        textArea.value = diffText;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
          document.execCommand("copy");
          setCopyState("copied");
        } catch (err) {
          console.error("Fallback copy failed", err);
          setCopyState("error");
        }
        document.body.removeChild(textArea);
      }
    } catch (err) {
      console.error("Copy failed", err);
      setCopyState("error");
    }

    setTimeout(() => setCopyState("idle"), 2000);
  };

  const addedCount = file.lines.filter((l) => l.type === "add").length;
  const removedCount = file.lines.filter((l) => l.type === "remove").length;

  return (
    <div className="border border-white/[0.08] bg-zinc-950/50 rounded-lg overflow-hidden">
      {/* File header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-black/50">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-expanded={isExpanded}
            aria-controls={contentId}
            className="flex items-center gap-2 text-left hover:bg-white/5 rounded px-2 py-1 -ml-2 transition-colors truncate"
          >
            {isExpanded ? (
              <ChevronDown className="h-3.5 w-3.5 text-white/60" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5 text-white/60" />
            )}
            <span className="text-[11px] font-mono text-white font-bold">
              {file.filename}
            </span>
          </button>
          {repoUrl && (
            <a
              href={`${repoUrl}/blob/${branch}/${file.filename}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 hover:text-white transition-colors"
              title="View on GitHub"
            >
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-[9px] font-mono">
            <span className="text-green-400">+{addedCount}</span>
            <span className="text-white/30">/</span>
            <span className="text-red-400">-{removedCount}</span>
          </div>
          <motion.button
            onClick={handleCopy}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-1 px-2 py-1 text-[9px] font-mono uppercase tracking-wider rounded bg-white/5 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white/80 transition-colors"
          >
            {copyState === "copied" ? (
              <Check className="h-3 w-3" />
            ) : copyState === "error" ? (
              <span className="text-red-400 font-bold">!</span>
            ) : (
              <Copy className="h-3 w-3" />
            )}
            <span>
              {copyState === "copied"
                ? "Copied"
                : copyState === "error"
                  ? "Error"
                  : "Copy"}
            </span>
          </motion.button>
        </div>
      </div>

      {/* Diff content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            id={contentId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto pb-1">
              <pre className="text-xs font-mono leading-relaxed m-0 w-full">
                {file.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      "flex",
                      line.type === "add" && "bg-green-500/10",
                      line.type === "remove" && "bg-red-500/10",
                      line.type === "header" && "bg-purple-500/5",
                    )}
                  >
                    {/* Line Numbers */}
                    <div className="flex w-24 shrink-0 select-none border-r border-white/5 bg-white/[0.02] text-right text-white/30">
                      <span className="w-10 pr-2">
                        {line.originalLineNumber || ""}
                      </span>
                      <span className="w-10 pr-2">
                        {line.modifiedLineNumber || ""}
                      </span>
                    </div>
                    {/* Content */}
                    <div
                      className={cn(
                        "px-4 flex-1 min-w-0 whitespace-pre-wrap break-all",
                        line.type === "add" && "text-green-400",
                        line.type === "remove" && "text-red-400",
                        line.type === "context" && "text-white/60",
                        line.type === "header" && "text-purple-400 font-bold",
                      )}
                    >
                      {line.content}
                    </div>
                  </div>
                ))}
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function DiffViewer({
  diff,
  className,
  repoUrl,
  branch,
}: DiffViewerProps) {
  const files = useMemo(() => parseDiff(diff), [diff]);

  if (files.length === 0) {
    return (
      <div className={cn("p-4 text-center", className)}>
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          No diff data available
        </p>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">
          {files.length} {files.length === 1 ? "file" : "files"} changed
        </div>
      </div>
      {files.map((file, idx) => (
        <FileDiff key={idx} file={file} repoUrl={repoUrl} branch={branch} />
      ))}
    </div>
  );
}
