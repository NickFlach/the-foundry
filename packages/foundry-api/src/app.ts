import express from "express";
import { APP_NAME } from "@the-foundry/shared";
import type { HealthResponse } from "@the-foundry/shared";
import { createWastelandRouter } from "./wasteland-routes.js";

const app = express();

app.get("/health", (_req, res) => {
  const response: HealthResponse = { status: "ok", name: APP_NAME };
  res.json(response);
});

// Lazy-init to avoid requiring DoltHubClient at import time (helps testing)
app.use("/api/wasteland", (req, res, next) => {
  const router = createWastelandRouter();
  router(req, res, next);
});

export { app };
