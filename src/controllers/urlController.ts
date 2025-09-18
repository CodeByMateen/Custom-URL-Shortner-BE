import { Request, Response } from "express";
// import { UrlService } from "../services/urlService";
import { UrlServiceSharded } from "../services/urlServiceSharded";

// const urlService = new UrlService();
const urlService = new UrlServiceSharded();

export class UrlController {
  async createShortUrl(req: Request, res: Response): Promise<void> {
    try {
      const { url } = req.body;

      if (!url) {
        res.status(400).json({ error: "URL is required" });
        return;
      }

      const result = await urlService.createShortUrl(url);

      res.status(201).json({
        success: true,
        data: {
          originalUrl: url,
          shortUrl: result.shortUrl,
          shortCode: result.shortCode,
        },
      });
    } catch (error) {
      console.error("Error creating short URL:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async redirectToOriginal(req: Request, res: Response): Promise<void> {
    try {
      const { shortUrl } = req.query;

      if (!shortUrl || typeof shortUrl !== 'string') {
        res.status(400).json({ error: "Short URL is required" });
        return;
      }

      const originalUrl = await urlService.getOriginalUrl(shortUrl);

      if (!originalUrl) {
        res.status(404).json({ error: "URL not found" });
        return;
      }

      res.status(200).json({
        success: true,
        data: {
          originalUrl: originalUrl,
          shortUrl: shortUrl
        }
      });
    } catch (error) {
      console.error("Error redirecting:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }

  async getAllUrls(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await urlService.getAllUrls(page, limit);

      res.status(200).json({
        success: true,
        data: result.urls,
        pagination: result.pagination,
      });
    } catch (error) {
      console.error("Error fetching URLs:", error);
      res.status(500).json({
        error: error instanceof Error ? error.message : "Internal server error",
      });
    }
  }
}
