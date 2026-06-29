import { setInterval } from "node:timers";
import { getEnv } from "../../../packages/service-kit/src/config.mjs";
import { createLogger } from "../../../packages/service-kit/src/logger.mjs";

const logger = createLogger("sync-worker");

const rabbitMqUrl = getEnv("RABBITMQ_URL", "amqp://guest:guest@localhost:5672");
const objectStorageEndpoint = getEnv("OBJECT_STORAGE_ENDPOINT", "http://localhost:9000");

logger.info("worker_started", {
  rabbitMqUrl: rabbitMqUrl.replace(/:\/\/.*@/, "://***@"),
  objectStorageEndpoint
});

setInterval(() => {
  logger.info("sync_tick", {
    queues: ["account-sync", "achievement-import", "notification-dispatch"],
    mode: "adapter-ready"
  });
}, 30000);
