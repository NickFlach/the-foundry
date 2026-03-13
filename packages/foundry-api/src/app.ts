import express from "express";
import cors from "cors";
import { APP_NAME } from "@the-foundry/shared";
import type { HealthResponse } from "@the-foundry/shared";
import { createWastelandRouter } from "./wasteland-routes.js";
import { communityRouter } from "./community-routes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_req, res) => {
  const response: HealthResponse = { status: "ok", name: APP_NAME };
  res.json(response);
});

// Community spaces API
app.use("/api", communityRouter);

// Lazy-init to avoid requiring DoltHubClient at import time (helps testing)
app.use("/api/wasteland", (req, res, next) => {
  const router = createWastelandRouter();
  router(req, res, next);
});

export { app };
