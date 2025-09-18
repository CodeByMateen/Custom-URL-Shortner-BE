export interface ShardConfig {
  id: number;
  name: string;
  databaseUrl: string;
  weight: number; // For load balancing
}

export interface ShardingConfig {
  totalShards: number;
  shards: ShardConfig[];
  shardingStrategy: "hash" | "range" | "directory";
}

// Default sharding configuration
export const defaultShardingConfig: ShardingConfig = {
  totalShards: 3,
  shardingStrategy: "hash",
  shards: [
    {
      id: 0,
      name: "shard-0",
      databaseUrl: process.env.DATABASE_URL_SHARD_0 || "",
      weight: 1,
    },
    {
      id: 1,
      name: "shard-1",
      databaseUrl: process.env.DATABASE_URL_SHARD_1 || "",
      weight: 1,
    },
    {
      id: 2,
      name: "shard-2",
      databaseUrl: process.env.DATABASE_URL_SHARD_2 || "",
      weight: 1,
    },
  ],
};

// Get sharding config from environment or use default
export function getShardingConfig(): ShardingConfig {
  const config = process.env.SHARDING_CONFIG;

  if (config) {
    return JSON.parse(config);
  }

  return defaultShardingConfig;
}
