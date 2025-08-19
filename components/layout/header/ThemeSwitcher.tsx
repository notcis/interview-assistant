"use client";

import { Icon } from "@iconify/react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function ThemeSwitcher() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  console.log(theme);

  return (
    <div>
      {theme === "dark" ? (
        <Icon
          icon="mdi:white-balance-sunny"
          fontSize={22}
          onClick={() => setTheme("light")}
        />
      ) : (
        <Icon
          icon="mdi:moon-waxing-crescent"
          fontSize={22}
          onClick={() => setTheme("dark")}
        />
      )}
    </div>
  );
}
