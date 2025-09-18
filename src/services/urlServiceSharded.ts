import { getShardId } from "../utils/shardingUtils";
import { getPrismaClientByShardId, executeAcrossAllShards } from "../database/prismaSharded";
import { getShardingConfig } from "../config/sharding";
import {
  idToBase62,
  generateSalt,
  isValidUrl,
  extractShortCode,
} from "../utils/urlUtils";
import { CacheService } from "./cacheService";
import { createId } from "@paralleldrive/cuid2";

const BASE_URL = process.env.BASE_URL;

export class UrlServiceSharded {
  private config = getShardingConfig();

  async createShortUrl(
    originalUrl: string
  ): Promise<{ shortUrl: string; shortCode: string }> {
    if (!isValidUrl(originalUrl)) {
      throw new Error("Invalid URL provided");
    }

    // Check if URL already exists across all shards
    const existingUrl = await this.findExistingUrlAcrossShards(originalUrl);
    if (existingUrl) {
      // Cache existing URL
      await CacheService.setUrlMapping(existingUrl.shortCode, originalUrl);
      return {
        shortUrl: `${BASE_URL}/${existingUrl.shortCode}`,
        shortCode: existingUrl.shortCode,
      };
    }

    // Generate CUID and Salt
    const cuid = createId();
    const salt = generateSalt();

    // Convert CUID + Salt to Base 62 short code
    const idNumber = parseInt(cuid.slice(-8), 16);
    const shortCode = idToBase62(idNumber + salt);

    // Determine which shard this shortCode belongs to
    const shardId = getShardId(shortCode, this.config);
    const prisma = getPrismaClientByShardId(shardId, this.config);

    // Create URL in the appropriate shard
    const url = await prisma.url.create({
      data: {
        originalUrl,
        shortCode,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      },
    });

    // Cache the new URL mapping
    await CacheService.setUrlMapping(shortCode, originalUrl);

    // Clear pagination cache since we added a new URL
    await CacheService.clearAllPaginatedCache();

    return {
      shortUrl: `${BASE_URL}/${url.shortCode}`,
      shortCode: url.shortCode,
    };
  }

  async getOriginalUrl(shortUrl: string): Promise<string | null> {
    const shortCode = extractShortCode(shortUrl);

    // Try cache first
    const cachedUrl = await CacheService.getUrlMapping(shortCode);
    if (cachedUrl) {
      return cachedUrl;
    }

    // Determine which shard contains this shortCode
    const shardId = getShardId(shortCode, this.config);
    const prisma = getPrismaClientByShardId(shardId, this.config);

    // Get from the specific shard
    const url = await prisma.url.findUnique({
      where: { shortCode },
    });

    if (!url) {
      return null;
    }

    // Cache the URL for future requests
    await CacheService.setUrlMapping(shortCode, url.originalUrl);

    return url.originalUrl;
  }

  async getAllUrls(
    page: number = 1,
    limit: number = 10
  ): Promise<{
    urls: Array<{
      id: string;
      originalUrl: string;
      shortCode: string;
      shortUrl: string;
      createdAt: Date;
      expiresAt: Date | null;
    }>;
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    // Try cache first
    const cachedResult = await CacheService.getPaginatedUrls(page, limit);
    if (cachedResult) {
      return cachedResult;
    }

    // Get URLs from all shards and combine them
    const allUrls = await this.getAllUrlsFromAllShards();
    
    // Sort by creation date (newest first)
    allUrls.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Apply pagination
    const skip = (page - 1) * limit;
    const paginatedUrls = allUrls.slice(skip, skip + limit);

    const urlsWithShortUrl = paginatedUrls.map((url) => ({
      ...url,
      shortUrl: `${BASE_URL}/${url.shortCode}`,
    }));

    const totalPages = Math.ceil(allUrls.length / limit);

    const result = {
      urls: urlsWithShortUrl,
      pagination: {
        page,
        limit,
        total: allUrls.length,
        totalPages,
      },
    };

    // Cache the result
    await CacheService.setPaginatedUrls(page, limit, result);

    return result;
  }

  private async findExistingUrlAcrossShards(originalUrl: string) {
    const results = await executeAcrossAllShards(
      this.config,
      async (prisma, shardId) => {
        return await prisma.url.findFirst({
          where: { originalUrl },
        });
      }
    );

    // Find the first non-null result
    for (const [shardId, url] of results) {
      if (url) {
        return url;
      }
    }

    return null;
  }

  private async getAllUrlsFromAllShards() {
    const results = await executeAcrossAllShards(
      this.config,
      async (prisma, shardId) => {
        return await prisma.url.findMany({
          select: {
            id: true,
            originalUrl: true,
            shortCode: true,
            createdAt: true,
            expiresAt: true,
          },
        });
      }
    );

    // Flatten results from all shards
    const allUrls = [];
    for (const [shardId, urls] of results) {
      allUrls.push(...urls);
    }

    return allUrls;
  }

  // Utility method to get statistics across all shards
  async getShardStatistics() {
    const results = await executeAcrossAllShards(
      this.config,
      async (prisma, shardId) => {
        const count = await prisma.url.count();
        return { shardId, count };
      }
    );

    return Array.from(results.values());
  }
}

