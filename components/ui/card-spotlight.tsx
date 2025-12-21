"use client";

import { useMotionValue, motion, useMotionTemplate } from "framer-motion";
import { MouseEvent } from "react";
import { cn } from "@/lib/utils";

interface CardSpotlightProps {
  children: React.ReactNode;
  radius?: number;
  color?: string;
  className?: string;
}

export function CardSpotlight({
  children,
  radius = 350,
  color = "#262626",
  className,
}: CardSpotlightProps) {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }: MouseEvent) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={cn(
        "group relative rounded-none border border-white/[0.08] bg-black",
        className,
      )}
      onMouseMove={handleMouseMove}
    >
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-none opacity-0 transition duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${radius}px circle at ${mouseX}px ${mouseY}px,
              ${color},
              transparent 80%
            )
          `,
        }}
      />
      {children}
    </div>
  );
}
