/**
 * Grafana Loki NoSQL Log Aggregator & API Call Tracing Client
 * Ships structured telemetry and traces to Loki via /loki/api/v1/push
 * Documentation: https://github.com/grafana/loki
 */

export interface LokiLogEntry {
  level: "info" | "warn" | "error" | "debug";
  message: string;
  traceId?: string;
  data?: Record<string, unknown>;
  timestamp?: number; // epoch ms
}

class LokiLogger {
  private lokiUrl: string | null;
  private tenantId?: string;
  private defaultLabels: Record<string, string>;
  private queue: Array<{ labels: Record<string, string>; value: [string, string] }> = [];
  private flushTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.lokiUrl = process.env.LOKI_URL?.replace(/\/+$/, "") || null;
    this.tenantId = process.env.LOKI_TENANT_ID;
    this.defaultLabels = {
      app: "lesson-plan-maker",
      env: process.env.NODE_ENV || "development",
      service: "ai-vision-api",
    };
  }

  public log(entry: LokiLogEntry) {
    const epochMs = entry.timestamp ?? Date.now();
    const timestampNs = `${epochMs}000000`;

    // Low-cardinality labels for Loki TSDB index
    const streamLabels: Record<string, string> = {
      ...this.defaultLabels,
      level: entry.level,
    };

    // Rich structured JSON payload (never indexed as raw labels, grep-at-query-time in LogQL)
    const logPayload = JSON.stringify({
      message: entry.message,
      trace_id: entry.traceId,
      timestamp_iso: new Date().toISOString(),
      ...entry.data,
    });

    this.queue.push({
      labels: streamLabels,
      value: [timestampNs, logPayload],
    });

    // Console mirror in development
    if (process.env.NODE_ENV !== "production") {
      const prefix = `[Loki:${entry.level.toUpperCase()}]`;
      if (entry.level === "error") {
        console.error(prefix, entry.message, entry.data || "");
      } else if (entry.level === "warn") {
        console.warn(prefix, entry.message, entry.data || "");
      } else {
        console.log(prefix, entry.message, entry.data || "");
      }
    }

    if (!this.lokiUrl) {
      // No external Loki server configured; clear local queue
      this.queue = [];
      return;
    }

    // Flush batch if queue is filling up
    if (this.queue.length >= 8) {
      void this.flush();
    } else if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => void this.flush(), 1500);
    }
  }

  public info(message: string, data?: Record<string, unknown>, traceId?: string) {
    this.log({ level: "info", message, data, traceId });
  }

  public warn(message: string, data?: Record<string, unknown>, traceId?: string) {
    this.log({ level: "warn", message, data, traceId });
  }

  public error(message: string, error?: unknown, data?: Record<string, unknown>, traceId?: string) {
    const errorData =
      error instanceof Error
        ? { error_name: error.name, error_message: error.message, stack: error.stack }
        : { raw_error: String(error) };

    this.log({
      level: "error",
      message,
      traceId,
      data: { ...errorData, ...data },
    });
  }

  /**
   * Flushes queued log streams to Loki HTTP push endpoint (/loki/api/v1/push)
   */
  public async flush(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }

    if (!this.lokiUrl || this.queue.length === 0) {
      this.queue = [];
      return;
    }

    const itemsToSend = [...this.queue];
    this.queue = [];

    // Group entries into stream label buckets
    const streamsMap = new Map<string, { stream: Record<string, string>; values: [string, string][] }>();

    for (const item of itemsToSend) {
      const key = JSON.stringify(item.labels);
      if (!streamsMap.has(key)) {
        streamsMap.set(key, { stream: item.labels, values: [] });
      }
      streamsMap.get(key)!.values.push(item.value);
    }

    const payload = {
      streams: Array.from(streamsMap.values()),
    };

    try {
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (this.tenantId) {
        headers["X-Scope-OrgID"] = this.tenantId;
      }

      // Basic auth (e.g. Grafana Cloud instance ID & API token)
      if (process.env.LOKI_USER && (process.env.LOKI_PASSWORD || process.env.LOKI_TOKEN)) {
        const secret = process.env.LOKI_PASSWORD || process.env.LOKI_TOKEN;
        const credentials = Buffer.from(`${process.env.LOKI_USER}:${secret}`).toString("base64");
        headers["Authorization"] = `Basic ${credentials}`;
      } else if (process.env.LOKI_BEARER_TOKEN) {
        headers["Authorization"] = `Bearer ${process.env.LOKI_BEARER_TOKEN}`;
      }

      const endpoint = `${this.lokiUrl}/loki/api/v1/push`;
      const res = await fetch(endpoint, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(5000), // Non-blocking 5s timeout
      });

      if (!res.ok) {
        const body = await res.text();
        console.warn(`[Loki] Push failed (${res.status}): ${body.slice(0, 200)}`);
      }
    } catch (err: unknown) {
      console.warn("[Loki] Unable to push log batch to Loki:", err instanceof Error ? err.message : String(err));
    }
  }
}

export const loki = new LokiLogger();
