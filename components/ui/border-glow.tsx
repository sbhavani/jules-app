"use client";

import { cn } from "@/lib/utils";

interface BorderGlowProps {
  children: React.ReactNode;
  className?: string;
  containerClassName?: string;
  glowColor?: string;
  animated?: boolean;
}

export function BorderGlow({
  children,
  className,
  containerClassName,
  glowColor = "rgba(168, 85, 247, 0.3)",
  animated = false,
}: BorderGlowProps) {
  return (
    <div className={cn("group relative", className)}>
      {/* Animated border glow */}
      <div
        className={cn(
          "absolute -inset-[1px] rounded-lg opacity-0 transition-opacity duration-500",
          "group-hover:opacity-100",
          animated && "animate-pulse",
        )}
        style={{
          background: `linear-gradient(135deg, ${glowColor}, transparent 50%, ${glowColor})`,
        }}
      />

      {/* Inner content container */}
      <div className={cn("relative rounded-lg bg-card", containerClassName)}>
        {children}
      </div>
    </div>
  );
}
