"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function BackgroundBeams({ className }: { className?: string }) {
  const paths = [
    "M-380 -189C-380 -189 -312 216 152 343C616 470 684 875 684 875",
    "M-373 -197C-373 -197 -305 208 159 335C623 462 691 867 691 867",
    "M-366 -205C-366 -205 -298 200 166 327C630 454 698 859 698 859",
  ];

  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-0 overflow-hidden",
        className,
      )}
    >
      <svg
        className="absolute h-full w-full"
        width="100%"
        height="100%"
        viewBox="0 0 696 316"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {paths.map((path, index) => (
          <motion.path
            key={index}
            d={path}
            stroke={`url(#gradient-${index})`}
            strokeWidth="1"
            initial={{
              pathLength: 0,
            }}
            animate={{
              pathLength: [0, 0.4, 0],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              delay: index * 2,
              ease: "linear",
            }}
          />
        ))}

        <defs>
          {paths.map((_, index) => (
            <linearGradient
              key={index}
              id={`gradient-${index}`}
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop offset="0%" stopColor="rgba(168, 85, 247, 0)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.6)" />
              <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
            </linearGradient>
          ))}
        </defs>
      </svg>
    </div>
  );
}
