import type { Metadata } from "next";
import { Geist, Geist_Mono as GeistMono } from "next/font/google";

import { QueryProvider } from "@/components/providers/query-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { appShellClassName } from "@/lib/theme";
import { cn } from "@/lib/utils";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const geistMono = GeistMono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Zen Chat",
  description:
    "Zen Chat is a modern AI chat workspace for designing, analyzing, and iterating on ideas with clarity.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={cn(
          "antialiased",
          geistSans.variable,
          geistMono.variable,
          appShellClassName,
        )}
      >
        <ThemeProvider>
          <QueryProvider>
            <div className="flex min-h-screen flex-col">
              <header className="border-b border-border/60 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <div className="mx-auto flex h-[var(--header-height)] w-full max-w-5xl items-center justify-between px-5">
                  <h1 className="text-lg font-semibold tracking-tight">Zen Chat</h1>
                  <ThemeToggle />
                </div>
              </header>
              <main className="flex-1">
                <div className="mx-auto w-full max-w-5xl px-5 py-8">{children}</div>
              </main>
              <footer className="border-t border-border/60 bg-background/80 py-4">
                <div className="mx-auto flex w-full max-w-5xl items-center justify-center px-5 text-xs text-muted-foreground">
                  <span>© {new Date().getFullYear()} Zen Chat</span>
                </div>
              </footer>
            </div>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
