export type ThemeScale = {
  colors: Record<string, string>;
  radii: Record<string, string>;
  spacing: Record<string, string>;
};

export const themeScale: ThemeScale = {
  colors: {
    background: "0 0% 100%",
    foreground: "220 13% 10%",
    muted: "220 15% 95%",
    "muted-foreground": "220 10% 42%",
    accent: "256 94% 61%",
    "accent-foreground": "0 0% 100%",
    border: "220 14% 90%",
    ring: "256 94% 61%",
    "background-dark": "222 47% 5%",
    "foreground-dark": "210 20% 96%",
    "muted-dark": "220 15% 16%",
    "muted-foreground-dark": "220 10% 66%",
    "accent-dark": "256 94% 67%",
    "accent-foreground-dark": "0 0% 100%",
    "border-dark": "220 14% 24%",
    "ring-dark": "256 94% 67%",
  },
  radii: {
    xl: "1.5rem",
    lg: "1rem",
    md: "0.75rem",
    sm: "0.5rem",
  },
  spacing: {
    "layout-gutter-mobile": "1.25rem",
    "layout-gutter-desktop": "2rem",
    "header-height": "4.5rem",
  },
};

export const appShellClassName =
  "flex min-h-screen flex-col bg-background text-foreground transition-colors ease-in-out-smooth";
