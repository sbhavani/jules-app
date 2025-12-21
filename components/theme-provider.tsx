"use client";

import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Theme } from "@radix-ui/themes";
import { useEffect, useState } from "react";
import type { ComponentProps } from "react";

type ThemeProviderProps = ComponentProps<typeof NextThemesProvider>;

function RadixThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line
    setMounted(true);
  }, []);

  return (
    <Theme
      accentColor="purple"
      appearance={mounted ? (resolvedTheme as "light" | "dark") : "dark"}
    >
      {children}
    </Theme>
  );
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <RadixThemeWrapper>{children}</RadixThemeWrapper>
    </NextThemesProvider>
  );
}
