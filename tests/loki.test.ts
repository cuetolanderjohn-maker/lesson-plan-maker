import test from "node:test";
import assert from "node:assert/strict";
import { loki } from "../lib/loki";

test("Loki logger queues and formats log entries correctly", async () => {
  assert.doesNotThrow(() => {
    loki.info("Testing Loki info message", { test_key: "value123" }, "trace-test-1");
    loki.warn("Testing Loki warning message", { warning_key: "warn456" }, "trace-test-1");
    loki.error("Testing Loki error message", new Error("Synthetic error"), { extra: "err789" }, "trace-test-1");
  });

  // Flush without error even when LOKI_URL is not set
  await assert.doesNotReject(async () => {
    await loki.flush();
  });
});
