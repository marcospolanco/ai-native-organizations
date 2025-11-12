"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

const TOGGLE_LABEL = "Toggle color scheme";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const handleToggle = () => {
    const nextTheme = resolvedTheme === "dark" ? "light" : "dark";
    setTheme(nextTheme);
  };

  if (!isMounted) {
    return (
      <span
        aria-hidden="true"
        className="inline-flex h-9 w-14 animate-pulse rounded-full bg-muted"
      />
    );
  }

  return (
    <button
      type="button"
      onClick={handleToggle}
      aria-label={TOGGLE_LABEL}
      className={cn(
        "inline-flex h-9 items-center rounded-full border border-border bg-background px-2 text-sm font-medium text-foreground shadow-soft-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "hover:bg-muted hover:text-foreground",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300",
          resolvedTheme === "dark" ? "translate-x-5 bg-accent" : "translate-x-0 bg-muted",
        )}
      />
      <span className="sr-only">{TOGGLE_LABEL}</span>
    </button>
  );
}
