"use client";

import { useState } from "react";

/**
 * Hook to check if terminal feature should be available
 * Returns true by default - connection errors are handled in the terminal component
 */
export function useTerminalAvailable() {
  // Check if user has explicitly disabled terminal via env var
  const isDisabled =
    typeof window !== "undefined" &&
    process.env.NEXT_PUBLIC_DISABLE_TERMINAL === "true";

  const [isAvailable] = useState(!isDisabled);
  const [isChecking] = useState(false);

  return { isAvailable, isChecking };
}
