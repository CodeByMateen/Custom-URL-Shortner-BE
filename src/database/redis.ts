import { createClient } from "redis";

// Create Redis client only if REDIS_URL is provided
let redisClient: any = null;

if (process.env.REDIS_URL) {
  redisClient = createClient({
    url: process.env.REDIS_URL,
  })
    .on("error", (err) => {
      console.error("Redis Client Error:", err);
    })
    .on("connect", () => {
      console.log("Connected to Redis");
    });

  // Connect to Redis
  redisClient.connect().catch((err: any) => {
    console.warn(
      "Redis connection failed, continuing without cache:",
      err.message
    );
    redisClient = null;
  });
} else {
  console.log("Redis URL not provided, running without cache");
}

export { redisClient };
