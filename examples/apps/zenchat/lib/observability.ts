import * as Sentry from "@sentry/nextjs";
import { captureAnalyticsEvent, identifyUser, resetUser } from "@/lib/analytics";
import type { ChatModelId } from "@/lib/validation";

export interface ObservabilityEvent {
  category: "chat" | "error" | "performance" | "user_action";
  action: string;
  properties?: Record<string, unknown>;
}

export interface ChatEventProperties extends Record<string, unknown> {
  model?: ChatModelId;
  messageCount?: number;
  conversationLength?: number;
  errorType?: string;
  errorMessage?: string;
  duration?: number;
}

class ObservabilityManager {
  private isInitialized = false;
  private userId: string | null = null;

  initialize(userId?: string): void {
    if (this.isInitialized) {
      return;
    }

    this.isInitialized = true;

    if (userId) {
      this.identifyUser(userId);
    }
  }

  identifyUser(userId: string, properties?: Record<string, unknown>): void {
    this.userId = userId;
    
    // Identify user in analytics
    identifyUser(userId, properties);
    
    // Set user context in Sentry
    Sentry.setUser({
      id: userId,
      ...properties,
    });
  }

  resetUser(): void {
    this.userId = null;
    resetUser();
    Sentry.setUser(null);
  }

  trackEvent(event: ObservabilityEvent): void {
    if (!this.isInitialized) {
      console.warn("Observability not initialized. Event not tracked:", event);
      return;
    }

    // Track in analytics
    captureAnalyticsEvent(`${event.category}_${event.action}`, {
      ...event.properties,
      userId: this.userId,
    });

    // Add breadcrumb to Sentry for context
    Sentry.addBreadcrumb({
      message: `${event.category}: ${event.action}`,
      category: event.category,
      level: "info",
      data: event.properties ?? {},
    });
  }

  trackError(error: Error, context?: Record<string, unknown>): void {
    if (!this.isInitialized) {
      console.error("Observability not initialized. Error not tracked:", error);
      return;
    }

    // Track error in analytics
    this.trackEvent({
      category: "error",
      action: "error_occurred",
      properties: {
        errorType: error.constructor.name,
        errorMessage: error.message,
        stackTrace: error.stack,
        ...context,
      },
    });

    // Capture in Sentry
    Sentry.captureException(error, {
      ...(context ? { extra: context } : {}),
      tags: {
        category: "error",
      },
    });
  }

  // Chat-specific tracking methods
  trackMessageSent(properties: ChatEventProperties): void {
    this.trackEvent({
      category: "chat",
      action: "message_sent",
      properties,
    });
  }

  trackMessageReceived(properties: ChatEventProperties): void {
    this.trackEvent({
      category: "chat",
      action: "message_received",
      properties,
    });
  }

  trackModelSwitch(fromModel: ChatModelId, toModel: ChatModelId): void {
    this.trackEvent({
      category: "user_action",
      action: "model_switched",
      properties: {
        fromModel,
        toModel,
      },
    });
  }

  trackConversationReset(properties: ChatEventProperties): void {
    this.trackEvent({
      category: "user_action",
      action: "conversation_reset",
      properties,
    });
  }

  trackStreamingStarted(properties: ChatEventProperties): void {
    this.trackEvent({
      category: "chat",
      action: "streaming_started",
      properties,
    });
  }

  trackStreamingCompleted(properties: ChatEventProperties): void {
    this.trackEvent({
      category: "chat",
      action: "streaming_completed",
      properties,
    });
  }

  trackStreamingError(properties: ChatEventProperties): void {
    this.trackEvent({
      category: "error",
      action: "streaming_error",
      properties,
    });
  }

  trackPerformance(metric: string, duration: number, properties?: Record<string, unknown>): void {
    this.trackEvent({
      category: "performance",
      action: metric,
      properties: {
        duration,
        ...properties,
      },
    });
  }

  // Utility methods
  startPerformanceTimer(label: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      this.trackPerformance(label, duration);
    };
  }

  withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
    fn: T,
    context?: Record<string, unknown>
  ): T {
    return (async (...args: Parameters<T>) => {
      try {
        return await fn(...args);
      } catch (capturedError) {
        this.trackError(capturedError as Error, context);
        throw capturedError;
      }
    }) as T;
  }
}

// Singleton instance
export const observability = new ObservabilityManager();

// Convenience functions for direct usage
export const trackMessageSent = (properties: ChatEventProperties) => 
  observability.trackMessageSent(properties);

export const trackMessageReceived = (properties: ChatEventProperties) => 
  observability.trackMessageReceived(properties);

export const trackModelSwitch = (fromModel: ChatModelId, toModel: ChatModelId) => 
  observability.trackModelSwitch(fromModel, toModel);

export const trackConversationReset = (properties: ChatEventProperties) => 
  observability.trackConversationReset(properties);

export const trackStreamingStarted = (properties: ChatEventProperties) => 
  observability.trackStreamingStarted(properties);

export const trackStreamingCompleted = (properties: ChatEventProperties) => 
  observability.trackStreamingCompleted(properties);

export const trackStreamingError = (properties: ChatEventProperties) => 
  observability.trackStreamingError(properties);

export const trackError = (error: Error, context?: Record<string, unknown>) => 
  observability.trackError(error, context);