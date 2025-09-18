import { ShardingConfig } from '../config/sharding';

/**
 * Hash-based sharding function
 * Uses consistent hashing to determine which shard a shortCode belongs to
 */
export function getShardIdByHash(shortCode: string, totalShards: number): number {
  let hash = 0;
  
  // Simple hash function (you can use crypto.createHash for better distribution)
  for (let i = 0; i < shortCode.length; i++) {
    const char = shortCode.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  return Math.abs(hash) % totalShards;
}

/**
 * Range-based sharding function
 * Splits data by character ranges
 */
export function getShardIdByRange(shortCode: string, totalShards: number): number {
  const firstChar = shortCode.charAt(0).toLowerCase();
  const charCode = firstChar.charCodeAt(0);
  
  // Distribute characters across shards
  const charsPerShard = Math.ceil(36 / totalShards); // 26 letters + 10 digits
  
  if (charCode >= 48 && charCode <= 57) {
    // Numbers 0-9
    return Math.floor((charCode - 48) / charsPerShard);
  } else if (charCode >= 97 && charCode <= 122) {
    // Letters a-z
    return Math.floor((charCode - 97 + 10) / charsPerShard);
  }
  
  return 0; // Default to first shard
}

/**
 * Main sharding function that determines which shard to use
 */
export function getShardId(shortCode: string, config: ShardingConfig): number {
  switch (config.shardingStrategy) {
    case 'hash':
      return getShardIdByHash(shortCode, config.totalShards);
    case 'range':
      return getShardIdByRange(shortCode, config.totalShards);
    case 'directory':
      // For directory-based sharding, you'd typically use a lookup table
      // This is a simplified version
      return getShardIdByHash(shortCode, config.totalShards);
    default:
      return getShardIdByHash(shortCode, config.totalShards);
  }
}

/**
 * Get shard configuration by ID
 */
export function getShardConfig(shardId: number, config: ShardingConfig) {
  return config.shards.find(shard => shard.id === shardId);
}

/**
 * Validate if shard ID is valid
 */
export function isValidShardId(shardId: number, config: ShardingConfig): boolean {
  return shardId >= 0 && shardId < config.totalShards;
}

