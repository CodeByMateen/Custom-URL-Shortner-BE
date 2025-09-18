import { PrismaClient } from '@prisma/client';
import { ShardingConfig, ShardConfig } from '../config/sharding';

// Cache for Prisma clients per shard
const prismaClients = new Map<number, PrismaClient>();

/**
 * Get or create Prisma client for a specific shard
 */
export function getPrismaClient(shardId: number, shardConfig: ShardConfig): PrismaClient {
  if (prismaClients.has(shardId)) {
    return prismaClients.get(shardId)!;
  }

  const client = new PrismaClient({
    datasources: {
      db: {
        url: shardConfig.databaseUrl
      }
    }
  });

  prismaClients.set(shardId, client);
  return client;
}

/**
 * Get Prisma client for a specific shard by ID
 */
export function getPrismaClientByShardId(shardId: number, config: ShardingConfig): PrismaClient {
  const shardConfig = config.shards.find(shard => shard.id === shardId);
  
  if (!shardConfig) {
    throw new Error(`Shard ${shardId} not found in configuration`);
  }

  return getPrismaClient(shardId, shardConfig);
}

/**
 * Get all Prisma clients for all shards
 */
export function getAllPrismaClients(config: ShardingConfig): Map<number, PrismaClient> {
  const clients = new Map<number, PrismaClient>();
  
  config.shards.forEach(shard => {
    clients.set(shard.id, getPrismaClient(shard.id, shard));
  });

  return clients;
}

/**
 * Disconnect all Prisma clients
 */
export async function disconnectAllClients(): Promise<void> {
  const disconnectPromises = Array.from(prismaClients.values()).map(client => 
    client.$disconnect()
  );
  
  await Promise.all(disconnectPromises);
  prismaClients.clear();
}

/**
 * Execute a function across all shards
 */
export async function executeAcrossAllShards<T>(
  config: ShardingConfig,
  operation: (client: PrismaClient, shardId: number) => Promise<T>
): Promise<Map<number, T>> {
  const results = new Map<number, T>();
  const promises = config.shards.map(async (shard) => {
    const client = getPrismaClient(shard.id, shard);
    const result = await operation(client, shard.id);
    results.set(shard.id, result);
  });

  await Promise.all(promises);
  return results;
}

