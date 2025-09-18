import { redisClient } from "../database/redis";

export class CacheService {
  private static readonly CACHE_TTL = 24 * 60 * 60; // 24 hours in seconds

  // Cache URL mapping
  static async setUrlMapping(
    shortCode: string,
    originalUrl: string
  ): Promise<void> {
    if (!redisClient) return; // Skip if Redis not available
    const key = `url:${shortCode}`;
    await redisClient.setEx(key, this.CACHE_TTL, originalUrl);
  }

  static async getUrlMapping(shortCode: string): Promise<string | null> {
    if (!redisClient) return null; // Skip if Redis not available
    const key = `url:${shortCode}`;
    return await redisClient.get(key);
  }

  // Cache paginated URLs
  static async setPaginatedUrls(
    page: number,
    limit: number,
    data: any
  ): Promise<void> {
    if (!redisClient) return; // Skip if Redis not available
    const key = `urls:page:${page}:limit:${limit}`;
    await redisClient.setEx(key, this.CACHE_TTL, JSON.stringify(data));
  }

  static async getPaginatedUrls(
    page: number,
    limit: number
  ): Promise<any | null> {
    if (!redisClient) return null; // Skip if Redis not available
    const key = `urls:page:${page}:limit:${limit}`;
    const cached = await redisClient.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  static async clearAllPaginatedCache(): Promise<void> {
    if (!redisClient) return; // Skip if Redis not available
    const pattern = "urls:page:*";
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
    }
  }
}
