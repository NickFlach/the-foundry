import { Router } from "express";
import { DoltHubClient } from "@the-foundry/shared";
import type { WantedFilters } from "@the-foundry/shared";

export function createWastelandRouter(client?: DoltHubClient): Router {
  const router = Router();
  const dolt = client ?? new DoltHubClient();

  router.get("/wanted", async (req, res) => {
    try {
      const filters: WantedFilters = {
        project: req.query.project as string | undefined,
        status: req.query.status as string | undefined,
        type: req.query.type as string | undefined,
        priority: req.query.priority as string | undefined,
      };
      const items = await dolt.getWanted(filters);
      res.json({ items });
    } catch (err) {
      res.status(502).json({ error: "Failed to fetch wanted items", detail: String(err) });
    }
  });

  router.get("/wanted/:id", async (req, res) => {
    try {
      const item = await dolt.getWantedById(req.params.id);
      if (!item) {
        res.status(404).json({ error: "Wanted item not found" });
        return;
      }
      res.json({ item });
    } catch (err) {
      res.status(502).json({ error: "Failed to fetch wanted item", detail: String(err) });
    }
  });

  router.get("/rigs", async (_req, res) => {
    try {
      const rigs = await dolt.getRigs();
      res.json({ rigs });
    } catch (err) {
      res.status(502).json({ error: "Failed to fetch rigs", detail: String(err) });
    }
  });

  router.get("/stats", async (_req, res) => {
    try {
      const stats = await dolt.getStats();
      res.json({ stats });
    } catch (err) {
      res.status(502).json({ error: "Failed to fetch stats", detail: String(err) });
    }
  });

  return router;
}
