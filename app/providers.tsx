// app/providers.tsx
"use client";

import { HeroUIProvider } from "@heroui/react";
import { ThemeProviderProps } from "next-themes";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { SessionProvider } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProvidersProps {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
}

export function Providers({ children, themeProps }: ProvidersProps) {
  const router = useRouter();

  return (
    <HeroUIProvider navigate={router.push}>
      <NextThemesProvider {...themeProps}>
        <SessionProvider>{children}</SessionProvider>
      </NextThemesProvider>
    </HeroUIProvider>
  );
}
