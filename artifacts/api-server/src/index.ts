import app from "./app";
import { logger } from "./lib/logger";
import { ensureSeedSkills } from "./services/skillRegistry.js";
import { sweepMonthlyBudgets } from "./services/skillRuntime.js";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Spec wording: register seed skills explicitly at startup (rather than
// relying on the lazy first-read seed). Idempotent — safe to call on every boot.
try {
  ensureSeedSkills();
} catch (err) {
  logger.error({ err }, "Failed to register seed skills");
}

// Spec F: monthly budget sweep. Lazy reset in getBudget handles active
// dragons; this catches dormant ones whose stored reset_month is stale.
try {
  const reset = sweepMonthlyBudgets();
  if (reset > 0) logger.info({ reset }, "Monthly budget sweep reset stale dragons");
} catch (err) {
  logger.error({ err }, "Monthly budget sweep failed");
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
