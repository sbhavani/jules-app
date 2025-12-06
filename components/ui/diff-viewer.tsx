'use client';

import { useState } from 'react';
import { Check, Copy, ChevronDown, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface DiffFile {
  filename: string;
  diff: string;
}

interface DiffViewerProps {
  diff: string;
  className?: string;
}

interface ParsedDiffFile {
  filename: string;
  lines: DiffLine[];
}

interface DiffLine {
  type: 'add' | 'remove' | 'context' | 'header';
  content: string;
  lineNumber?: number;
}

function parseDiff(diff: string): ParsedDiffFile[] {
  const files: ParsedDiffFile[] = [];
  const lines = diff.split('\n');
  let currentFile: ParsedDiffFile | null = null;

  for (const line of lines) {
    // File header: diff --git a/file b/file
    if (line.startsWith('diff --git')) {
      if (currentFile) {
        files.push(currentFile);
      }
      const match = line.match(/b\/(.+)$/);
      currentFile = {
        filename: match ? match[1] : 'unknown',
        lines: []
      };
    } else if (currentFile) {
      // Skip metadata lines
      if (line.startsWith('index ') || line.startsWith('---') || line.startsWith('+++')) {
        continue;
      }
      // Chunk header: @@ -1,5 +1,5 @@
      else if (line.startsWith('@@')) {
        currentFile.lines.push({
          type: 'header',
          content: line
        });
      }
      // Added line
      else if (line.startsWith('+')) {
        currentFile.lines.push({
          type: 'add',
          content: line
        });
      }
      // Removed line
      else if (line.startsWith('-')) {
        currentFile.lines.push({
          type: 'remove',
          content: line
        });
      }
      // Context line
      else if (line.startsWith(' ')) {
        currentFile.lines.push({
          type: 'context',
          content: line
        });
      }
    }
  }

  if (currentFile) {
    files.push(currentFile);
  }

  return files;
}

function FileDiff({ file }: { file: ParsedDiffFile }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const diffText = file.lines.map(line => line.content).join('\n');
    await navigator.clipboard.writeText(diffText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const addedCount = file.lines.filter(l => l.type === 'add').length;
  const removedCount = file.lines.filter(l => l.type === 'remove').length;

  return (
    <div className="border border-white/[0.08] bg-zinc-950/50 rounded-lg overflow-hidden">
      {/* File header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.08] bg-black/50">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 flex-1 text-left hover:bg-white/5 rounded px-2 py-1 -mx-2 transition-colors"
        >
          {isExpanded ? (
            <ChevronDown className="h-3.5 w-3.5 text-white/60" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 text-white/60" />
          )}
          <span className="text-[11px] font-mono text-white font-bold">{file.filename}</span>
        </button>
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
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </motion.button>
        </div>
      </div>

      {/* Diff content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="overflow-x-auto">
              <pre className="text-[10px] font-mono leading-relaxed m-0">
                {file.lines.map((line, idx) => (
                  <div
                    key={idx}
                    className={cn(
                      'px-3 py-0.5',
                      line.type === 'add' && 'bg-green-500/10 text-green-400',
                      line.type === 'remove' && 'bg-red-500/10 text-red-400',
                      line.type === 'context' && 'text-white/60',
                      line.type === 'header' && 'text-purple-400 bg-purple-500/5 font-bold'
                    )}
                  >
                    {line.content}
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

export function DiffViewer({ diff, className }: DiffViewerProps) {
  const files = parseDiff(diff);

  if (files.length === 0) {
    return (
      <div className={cn('p-4 text-center', className)}>
        <p className="text-[10px] font-mono text-white/40 uppercase tracking-widest">
          No diff data available
        </p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center gap-2 mb-2">
        <div className="text-[9px] font-mono uppercase tracking-widest text-white/40">
          {files.length} {files.length === 1 ? 'file' : 'files'} changed
        </div>
      </div>
      {files.map((file, idx) => (
        <FileDiff key={idx} file={file} />
      ))}
    </div>
  );
}
