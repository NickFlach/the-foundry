import { Router } from "express";
import { FluxClient } from "@the-foundry/shared";

const router = Router();

function getFluxClient(): FluxClient {
  return new FluxClient();
}

// GET /api/flux/presence
router.get("/presence", async (_req, res) => {
  try {
    const client = getFluxClient();
    const entities = await client.getPresence();
    res.json(entities);
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// GET /api/flux/entity/:id
router.get("/entity/:id", async (req, res) => {
  try {
    const client = getFluxClient();
    const entity = await client.getEntity(req.params.id);
    res.json(entity);
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

// POST /api/flux/events
router.post("/events", async (req, res) => {
  try {
    const client = getFluxClient();
    await client.publishEvent(req.body);
    res.status(201).json({ ok: true });
  } catch (err: any) {
    res.status(502).json({ error: err.message });
  }
});

export { router as fluxRouter };
