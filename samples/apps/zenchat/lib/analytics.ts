"use client";

import { PostHog } from "posthog-js";

let posthog: PostHog | null = null;

export function getPostHog(): PostHog | null {
  if (typeof window === "undefined") {
    return null;
  }

  if (!posthog) {
    posthog = new PostHog(process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com",
      person_profiles: "identified_only",
      capture_pageview: false, // We'll capture pageviews manually
      capture_pageleave: true,
      // Disable in development
      loaded: (ph) => {
        if (process.env.NODE_ENV === "development") {
          ph.debug();
        }
      },
    });

    // Identify user if there's a user ID in localStorage
    const userId = localStorage.getItem("zenchat-user-id");
    if (userId) {
      posthog.identify(userId);
    }
  }

  return posthog;
}

export function initPostHog(): void {
  if (typeof window !== "undefined") {
    getPostHog(); // This will initialize PostHog
  }
}

export function captureAnalyticsEvent(
  eventName: string,
  properties?: Record<string, unknown>,
): void {
  const ph = getPostHog();
  if (ph) {
    ph.capture(eventName, {
      ...properties ?? {},
      app: "zenchat",
      timestamp: new Date().toISOString(),
    });
  }
}

export function identifyUser(userId: string, properties?: Record<string, unknown>): void {
  const ph = getPostHog();
  if (ph) {
    ph.identify(userId, properties);
    localStorage.setItem("zenchat-user-id", userId);
  }
}

export function resetUser(): void {
  const ph = getPostHog();
  if (ph) {
    ph.reset();
    localStorage.removeItem("zenchat-user-id");
  }
}

export function trackPageView(url?: string): void {
  const ph = getPostHog();
  if (ph) {
    ph.capture("$pageview", {
      $current_url: url ?? window.location.href,
    });
  }
}