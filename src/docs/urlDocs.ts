/**
 * @swagger
 * /api/url/create:
 *   post:
 *     summary: Create shortened URL
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               url:
 *                 type: string
 *                 description: The original URL to be shortened
 *                 example: "https://www.example.com"
 *             required:
 *               - url
 *     responses:
 *       201:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     originalUrl:
 *                       type: string
 *                     shortUrl:
 *                       type: string
 *                     shortCode:
 *                       type: string
 *       400:
 *         description: URL is required
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/url/redirect:
 *   get:
 *     summary: Redirect to original URL
 *     description: Takes a short URL and redirects to the original URL
 *     parameters:
 *       - in: query
 *         name: shortUrl
 *         required: true
 *         schema:
 *           type: string
 *         description: The full short URL (e.g., https://mtn.ly/abc123)
 *         example: "https://mtn.ly/abc123"
 *     responses:
 *       302:
 *         description: Successfully redirected to original URL
 *         headers:
 *           Location:
 *             description: The original URL
 *             schema:
 *               type: string
 *       404:
 *         description: URL not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "URL not found"
 *       400:
 *         description: Invalid short URL
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Short Url is required"
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/url/get-all:
 *   get:
 *     summary: Get all URLs with pagination
 *     description: Retrieve all shortened URLs with pagination support
 *     parameters:
 *       - in: query
 *         name: page
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *         description: Page number for pagination
 *         example: 1
 *       - in: query
 *         name: limit
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 10
 *         description: Number of URLs per page
 *         example: 10
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       originalUrl:
 *                         type: string
 *                       shortCode:
 *                         type: string
 *                       shortUrl:
 *                         type: string
 *                         example: "https://mtn.ly/1Pc9g"
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       expiresAt:
 *                         type: string
 *                         format: date-time
 *                         nullable: true
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       400:
 *         description: Invalid pagination parameters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Page must be greater than 0"
 *       500:
 *         description: Internal server error
 */