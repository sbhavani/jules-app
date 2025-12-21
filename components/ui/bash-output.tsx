"use client";

import { CodeBlock } from "./code-block";

interface BashOutputProps {
  output: string;
  className?: string;
}

export function BashOutput({ output, className }: BashOutputProps) {
  return (
    <div className={className}>
      <div className="text-[9px] font-mono uppercase tracking-widest text-white/40 mb-2">
        Command Output
      </div>
      <CodeBlock code={output} language="bash" />
    </div>
  );
}
