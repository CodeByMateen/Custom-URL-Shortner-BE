import { createClient } from "redis";

const redisClient = createClient({
  url: process.env.REDIS_URL,
})
  .on("error", (err) => {
    console.error("Redis Client Error:", err);
  })
  .on("connect", () => {
    console.log("Connected to Redis");
  });

// Connect to Redis
redisClient.connect().catch(console.error);

export { redisClient };
