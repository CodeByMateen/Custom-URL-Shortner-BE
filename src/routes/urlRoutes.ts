import { Router } from "express";
import { UrlController } from "../controllers/urlController";

const router = Router();
const urlController = new UrlController();

router.post("/create", (req, res) => urlController.createShortUrl(req, res));
router.get("/redirect", (req, res) =>
  urlController.redirectToOriginal(req, res)
);
router.get("/get-all", (req, res) => urlController.getAllUrls(req, res));

export default router;
