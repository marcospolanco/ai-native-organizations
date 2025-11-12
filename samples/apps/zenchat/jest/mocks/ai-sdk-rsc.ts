export type StreamableValue<T = unknown> = Record<string, unknown> & {
  __type?: T;
};

const streamableRegistry = new WeakMap<StreamableValue<unknown>, unknown>();
const streamableState = new WeakMap<StreamableValue<unknown>, {
  isPending: boolean;
  error: unknown;
  subscribers: Set<() => void>;
}>();

// Track all streamables for React to subscribe to changes
const streamableSubscribers = new WeakMap<StreamableValue<unknown>, Set<() => void>>();

type StreamableValueWrapper<T> = {
  value: StreamableValue<T>;
  append: (value: T) => StreamableValueWrapper<T>;
  update: (value: T) => StreamableValueWrapper<T>;
  done: (...args: [T] | []) => StreamableValueWrapper<T>;
  error: (_error: unknown) => StreamableValueWrapper<T>;
};

function notifySubscribers(handle: StreamableValue<unknown>) {
  const state = streamableState.get(handle);
  if (state?.subscribers) {
    state.subscribers.forEach((subscriber) => {
      try {
        subscriber();
      } catch (error) {
        // Ignore subscriber errors in tests
      }
    });
  }
}

export function createStreamableValue<T>(initialValue?: T): StreamableValueWrapper<T> {
  const handle: StreamableValue<T> = {};

  if (initialValue !== undefined) {
    streamableRegistry.set(handle, initialValue);
  }

  // Initialize state as pending when streamable is created
  const subscribers = new Set<() => void>();
  streamableState.set(handle, { isPending: true, error: undefined, subscribers });
  streamableSubscribers.set(handle, subscribers);

  const wrapper: StreamableValueWrapper<T> = {
    value: handle,
    append: (value) => {
      const current = streamableRegistry.get(handle);
      if (typeof current === "string" && typeof value === "string") {
        streamableRegistry.set(handle, `${current}${value}`);
      } else {
        streamableRegistry.set(handle, value);
      }
      // Keep pending state when appending
      const state = streamableState.get(handle);
      if (state) {
        state.isPending = true;
        state.error = undefined;
      }
      notifySubscribers(handle);
      return wrapper;
    },
    update: (value) => {
      streamableRegistry.set(handle, value);
      const state = streamableState.get(handle);
      if (state) {
        state.isPending = true;
        state.error = undefined;
      }
      notifySubscribers(handle);
      return wrapper;
    },
    done: (value?: T) => {
      if (value !== undefined) {
        streamableRegistry.set(handle, value);
      }
      // Mark as done (not pending) when done is called
      const state = streamableState.get(handle);
      if (state) {
        state.isPending = false;
        state.error = undefined;
      }
      notifySubscribers(handle);
      return wrapper;
    },
    error: (error: unknown) => {
      const state = streamableState.get(handle);
      if (state) {
        state.isPending = false;
        state.error = error;
      }
      notifySubscribers(handle);
      return wrapper;
    },
  };

  return wrapper;
}

// Mock React hook that simulates useStreamableValue
// In tests, this will track the current value and state
export function useStreamableValue<T>(
  streamableValue?: StreamableValue<T>,
): [T | undefined, unknown, boolean] {
  const data = streamableValue
    ? (streamableRegistry.get(streamableValue) as T | undefined)
    : undefined;

  const state = streamableValue
    ? streamableState.get(streamableValue)
    : undefined;

  const isPending = state?.isPending ?? false;
  const error = state?.error;

  // In a real implementation, this would subscribe to changes
  // For testing, we return the current state synchronously
  return [data, error, isPending];
}




