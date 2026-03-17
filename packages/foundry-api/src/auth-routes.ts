/**
 * Auth Routes — proxies to auth.spacechild.love
 * 
 * The Foundry frontend calls these, which forward to the SpaceChild Auth service.
 * This keeps the auth URL configurable and avoids CORS complexity.
 */

import { Router } from "express";
import { register, login, refreshToken, authHealth } from "./auth-client.js";
import { requireAuth } from "./auth-middleware.js";

const router = Router();

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const result = await register(email, password, firstName, lastName);
    res.status(result.success ? 201 : 400).json(result);
  } catch (_error) {
    res.status(502).json({ error: "Auth service unavailable" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body ?? {};
    if (!email || !password) return res.status(400).json({ error: "email and password required" });
    const result = await login(email, password);
    res.status(result.success ? 200 : 401).json(result);
  } catch (_error) {
    res.status(502).json({ error: "Auth service unavailable" });
  }
});

// POST /api/auth/refresh
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken: token } = req.body ?? {};
    if (!token) return res.status(400).json({ error: "refreshToken required" });
    const result = await refreshToken(token);
    res.status(result.success ? 200 : 401).json(result);
  } catch (_error) {
    res.status(502).json({ error: "Auth service unavailable" });
  }
});

// GET /api/auth/me — requires valid token
router.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});

// GET /api/auth/health — check auth service status
router.get("/health", async (_req, res) => {
  try {
    const health = await authHealth();
    res.json(health);
  } catch (_error) {
    res.status(502).json({ error: "Auth service unavailable" });
  }
});

export { router as authRouter };
