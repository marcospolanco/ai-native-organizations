"use client";

import { useEffect } from "react";
import { initPostHog, trackPageView } from "@/lib/analytics";

interface AnalyticsProviderProps {
  children: React.ReactNode;
}

export function AnalyticsProvider({ children }: AnalyticsProviderProps) {
  useEffect(() => {
    // Initialize PostHog
    initPostHog();

    // Track initial page view
    trackPageView();

    // Handle route changes for client-side navigation
    const handleRouteChange = () => {
      trackPageView();
    };

    // Listen for popstate events (back/forward buttons)
    window.addEventListener("popstate", handleRouteChange);

    // Override pushState and replaceState to catch navigation changes
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      setTimeout(handleRouteChange, 0);
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      setTimeout(handleRouteChange, 0);
    };

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  return <>{children}</>;
}