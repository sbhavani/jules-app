import { cn } from "@/lib/utils";

interface GridBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  gridSize?: number;
  fadeIntensity?: number;
}

export function GridBackground({
  children,
  className,
  gridSize = 40,
  fadeIntensity = 20,
}: GridBackgroundProps) {
  return (
    <div className={cn("relative", className)}>
      {/* Grid pattern */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundSize: `${gridSize}px ${gridSize}px`,
          backgroundImage:
            "linear-gradient(to right, rgba(168, 85, 247, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(168, 85, 247, 0.05) 1px, transparent 1px)",
        }}
      />

      {/* Radial fade mask */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at center, transparent ${fadeIntensity}%, var(--background) 100%)`,
        }}
      />

      {/* Content */}
      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
