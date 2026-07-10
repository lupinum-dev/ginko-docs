import type { TrackingEvent } from "./events";

export type TrackingProviderHandler = (event: TrackingEvent) => void;

const providerHandlers = new Set<TrackingProviderHandler>();

export function registerTrackingProvider(handler: TrackingProviderHandler) {
  providerHandlers.add(handler);

  return () => {
    providerHandlers.delete(handler);
  };
}

export function clearTrackingProvidersForTest() {
  providerHandlers.clear();
}

export function getTrackingProviderCountForTest() {
  return providerHandlers.size;
}

export function dispatchTrackingEvent(event: TrackingEvent) {
  for (const handler of providerHandlers) {
    handler(event);
  }
}
