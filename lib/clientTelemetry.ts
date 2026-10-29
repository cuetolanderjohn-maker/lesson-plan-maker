/**
 * Client-Side Telemetry Dispatcher for Grafana Loki NoSQL Logging
 * Sends background telemetry to /api/telemetry/log -> Loki /loki/api/v1/push
 */

export function reportTelemetry(
  level: "info" | "warn" | "error",
  message: string,
  data?: Record<string, unknown>,
  traceId?: string
) {
  try {
    if (typeof window === "undefined") return;

    const payload = JSON.stringify({
      level,
      message,
      traceId: traceId || `browser-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      data: {
        ...data,
        url: window.location.href,
        screen: `${window.innerWidth}x${window.innerHeight}`,
      },
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: "application/json" });
      navigator.sendBeacon("/api/telemetry/log", blob);
    } else {
      void fetch("/api/telemetry/log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {
        // Silent catch: telemetry should never break UI
      });
    }
  } catch {
    // Non-blocking telemetry
  }
}
