import express from "express";
import { APP_NAME } from "@the-foundry/shared";
import type { HealthResponse } from "@the-foundry/shared";

const app = express();

app.get("/health", (_req, res) => {
  const response: HealthResponse = { status: "ok", name: APP_NAME };
  res.json(response);
});

export { app };
