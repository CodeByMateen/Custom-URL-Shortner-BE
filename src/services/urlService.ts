import { prisma } from "../database/prisma";
import {
  idToBase62,
  generateSalt,
  isValidUrl,
  extractShortCode,
} from "../utils/urlUtils";
import { CacheService } from "./cacheService";
import { createId } from "@paralleldrive/cuid2";

const BASE_URL = process.env.BASE_URL;

export class UrlService {
  async createShortUrl(
    originalUrl: string
  ): Promise<{ shortUrl: string; shortCode: string }> {
    if (!isValidUrl(originalUrl)) {
      throw new Error("Invalid URL provided");
    }

    const existingUrl = await prisma.url.findFirst({
      where: { originalUrl },
    });

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
    const idNumber = parseInt(cuid.slice(-8), 16); // Use last 8 chars of CUID as number
    const shortCode = idToBase62(idNumber + salt);

    // Single query: Create with final shortCode
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

    // Cache miss - get from database
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

    // Cache miss - get from database
    const skip = (page - 1) * limit;

    const [urls, total] = await Promise.all([
      prisma.url.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          originalUrl: true,
          shortCode: true,
          createdAt: true,
          expiresAt: true,
        },
      }),
      prisma.url.count(),
    ]);

    const urlsWithShortUrl = urls.map((url) => ({
      ...url,
      shortUrl: `${BASE_URL}/${url.shortCode}`,
    }));

    const totalPages = Math.ceil(total / limit);

    const result = {
      urls: urlsWithShortUrl,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
    };

    // Cache the result
    await CacheService.setPaginatedUrls(page, limit, result);

    return result;
  }
}
