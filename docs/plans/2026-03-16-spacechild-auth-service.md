# SpaceChild Auth Service — Standalone Deployment Plan

> **For implementer:** Use TDD throughout. Write failing test first. Watch it fail. Then implement.

**Goal:** Extract SpaceChild Auth from space-child-dream into a standalone identity service deployed at `auth.spacechild.love` on ninjaportal VM.

**Architecture:** Standalone Express server with mysql2 (Dolt) storage, extracted from space-child-dream's auth module. Nginx reverse proxy with Let's Encrypt TLS on Oracle Cloud ARM VM. OAuth2/OIDC provider for the Space Child ecosystem.

**Tech Stack:** Node.js 20, Express, mysql2, bcryptjs, jsonwebtoken, circomlibjs (Poseidon ZKP), zod, nodemailer, certbot, nginx, Dolt, PM2

**Source:** `C:\Users\nickf\Source\space-child-dream\server\modules\auth\` + related services

---

## Task 1: Scaffold Standalone Project + Storage Layer

**Goal:** Create the standalone spacechild-auth project with mysql2/Dolt storage replacing Drizzle/PostgreSQL.

**Files:**
- Create: `C:\Users\nickf\Source\spacechild-auth\package.json`
- Create: `C:\Users\nickf\Source\spacechild-auth\tsconfig.json`
- Create: `C:\Users\nickf\Source\spacechild-auth\.env.example`
- Create: `C:\Users\nickf\Source\spacechild-auth\src\db.ts` (mysql2 connection pool)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\schema.sql` (all auth tables for Dolt/MySQL)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\storage.ts` (all storage methods using mysql2)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\migrate.ts` (schema migration runner)
- Create: `C:\Users\nickf\Source\spacechild-auth\tests\storage.test.ts`

**Details:**
- Port ALL tables from `space-child-dream/shared/models/auth.ts` (Drizzle pgTable → MySQL CREATE TABLE)
- Tables: users, zk_credentials, proof_sessions, refresh_tokens, subdomain_access, email_verification_tokens, password_reset_tokens, oauth2_clients, oauth2_authorization_codes, oauth2_access_tokens, oauth2_refresh_tokens, oauth2_consents, mfa_methods, totp_secrets, webauthn_credentials, mfa_challenges, mfa_pending_logins
- Replace `gen_random_uuid()` with `UUID()` (MySQL), `jsonb` with `JSON`, `serial` with `INT AUTO_INCREMENT`, `text` with `TEXT`, `boolean` with `TINYINT(1)`
- Storage class: implement every method the auth service calls on `storage.*` using raw `pool.execute()` queries
- Key methods needed: getUser, getUserByEmail, upsertUser, updateUser, createZkCredential, getZkCredentialByCommitment, createProofSession, getProofSession, updateProofSession, createRefreshToken, getRefreshTokensByUser, revokeRefreshToken, revokeAllUserRefreshTokens, createEmailVerificationToken, consumeEmailVerificationToken, invalidateUserVerificationTokens, createPasswordResetToken, consumePasswordResetToken, invalidateUserPasswordResetTokens, plus all MFA storage methods
- DB config via env: `DB_HOST`, `DB_PORT` (default 3306), `DB_USER`, `DB_PASSWORD`, `DB_NAME` (default `spacechild_auth`)
- Test: verify connection, create tables, CRUD user, CRUD tokens

**Commit:** `feat: scaffold spacechild-auth with mysql2 storage layer`

---

## Task 2: Port Auth Service + Types + Events

**Goal:** Port the core auth service, types, and event system from space-child-dream.

**Files:**
- Create: `C:\Users\nickf\Source\spacechild-auth\src\types.ts` (from modules/auth/types.ts — copy as-is, remove Drizzle imports)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\events.ts` (simple EventEmitter-based, no dependency on space-child-dream's event-bus)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\auth-service.ts` (from modules/auth/service.ts — rewire imports to local storage/types/events)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\email.ts` (from services/email.ts — update APP_NAME to "SpaceChild Auth", APP_URL to auth.spacechild.love)
- Create: `C:\Users\nickf\Source\spacechild-auth\tests\auth-service.test.ts`

**Details:**
- AuthService singleton — keep all methods: register, login, generateTokens, verifyAccessToken, refreshAccessToken, revokeUserTokens, createZkProofRequest, verifyZkProof, verifyEmail, resendVerificationEmail, requestPasswordReset, resetPassword, generateAuthorizationCode, exchangeAuthorizationCode
- Remove all `await import("../db")` and `await import("@shared/models/auth")` dynamic imports — use local storage methods instead
- findUserByVerificationToken and findUserByResetToken: implement as storage methods (not inline Drizzle queries)
- Events: use Node EventEmitter instead of space-child-dream's custom event-bus
- Email: keep nodemailer transport, configurable via SMTP_* env vars
- Test: register → login → refresh → ZKP flow

**Commit:** `feat: port auth service, types, events, and email`

---

## Task 3: Port MFA (TOTP + WebAuthn)

**Goal:** Port MFA services for TOTP and WebAuthn support.

**Files:**
- Create: `C:\Users\nickf\Source\spacechild-auth\src\mfa.ts` (from services/mfa.ts)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\webauthn.ts` (from services/webauthn.ts — if exists)
- Create: `C:\Users\nickf\Source\spacechild-auth\tests\mfa.test.ts`

**Details:**
- Port TOTP: setup, verify, backup codes
- Port WebAuthn: registration, authentication challenges
- Rewire storage calls to local storage.ts
- Test: TOTP setup → verify code → backup code flow

**Commit:** `feat: port MFA (TOTP + WebAuthn)`

---

## Task 4: Port Middleware + Routes + Express Server

**Goal:** Create the Express server with all auth routes and middleware.

**Files:**
- Create: `C:\Users\nickf\Source\spacechild-auth\src\middleware.ts` (from modules/auth/middleware.ts)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\routes.ts` (from modules/auth/routes.ts)
- Create: `C:\Users\nickf\Source\spacechild-auth\src\server.ts` (Express app, CORS, health check)
- Create: `C:\Users\nickf\Source\spacechild-auth\tests\routes.test.ts`

**Details:**
- Middleware: isAuthenticated, optionalAuth, requireAdmin, requireRole, checkAuthRateLimit, clearAuthRateLimit, isValidSsoCallback, getClientIp
- Update TRUSTED_SSO_DOMAINS: add `spacechild.love`, `ninja-portal.com`, `the-foundry.app` (or whatever domain)
- Routes: all /auth/* and /oauth2/* endpoints
- Server: Express with CORS (configurable origins via CORS_ORIGINS env), JSON body parser, helmet, health check at GET /health
- Listen on PORT env (default 3100)
- CORS must allow credentials for cookie/token flows
- Test: health check, register + login via HTTP, token refresh

**Commit:** `feat: Express server with auth routes and middleware`

---

## Task 5: Build Script + GitHub Repo

**Goal:** Make it buildable, create GitHub repo, push initial code.

**Files:**
- Create: `C:\Users\nickf\Source\spacechild-auth\src\index.ts` (main entry — runs migrate then starts server)
- Modify: `C:\Users\nickf\Source\spacechild-auth\package.json` (add build/start/dev/test scripts)
- Create: `C:\Users\nickf\Source\spacechild-auth\README.md`
- Create: `C:\Users\nickf\Source\spacechild-auth\.gitignore`

**Details:**
- Build: `tsc` → `dist/`
- Start: `node dist/index.js`
- Dev: `tsx watch src/index.ts`
- Test: `vitest` or `jest`
- Entry point: run migrations (idempotent CREATE TABLE IF NOT EXISTS), then start Express
- README: what it is, how to deploy, env vars reference
- Push to `NickFlach/spacechild-auth` on GitHub

**Commit:** `feat: build system, README, initial release`

---

## Task 6: Deploy to ninjaportal

**Goal:** Install Dolt, deploy the service, configure nginx + TLS for auth.spacechild.love.

**Steps (manual — not sub-agent, requires SSH):**

1. **DNS:** Point `auth.spacechild.love` A record → 170.9.238.136
2. **Install Dolt on ninjaportal:**
   ```bash
   curl -L https://github.com/dolthub/dolt/releases/latest/download/install.sh | sudo bash
   dolt version
   ```
3. **Create database:**
   ```bash
   mkdir -p ~/spacechild-auth-db && cd ~/spacechild-auth-db
   dolt init
   dolt sql -q "CREATE DATABASE IF NOT EXISTS spacechild_auth"
   dolt sql-server -H 127.0.0.1 -P 3306 &
   ```
4. **Deploy app:**
   ```bash
   # scp built dist/ + package.json + node_modules to VM
   cd ~/spacechild-auth
   npm install --production
   # Create .env with SESSION_SECRET, DB_HOST=127.0.0.1, DB_PORT=3306, SMTP_*, etc.
   node dist/index.js  # test it works
   ```
5. **PM2:**
   ```bash
   npm install -g pm2
   pm2 start dist/index.js --name spacechild-auth
   pm2 save
   pm2 startup
   ```
6. **nginx + TLS:**
   ```bash
   sudo tee /etc/nginx/conf.d/auth.spacechild.love.conf << 'EOF'
   server {
       listen 80;
       server_name auth.spacechild.love;
       location / {
           proxy_pass http://127.0.0.1:3100;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   EOF
   sudo nginx -t && sudo systemctl reload nginx
   sudo certbot --nginx -d auth.spacechild.love
   ```
7. **Verify:** `curl https://auth.spacechild.love/health`

**Commit:** N/A (infrastructure)

---

## Task 7: Foundry Integration

**Goal:** Wire The Foundry to authenticate against auth.spacechild.love.

**Files:**
- Create: `C:\Users\nickf\Source\the-foundry\packages\foundry-db\src\auth-client.ts`
- Modify: `C:\Users\nickf\Source\the-foundry\packages\foundry-api\src\routes\identity.ts`

**Details:**
- Auth client: thin wrapper around fetch to auth.spacechild.love endpoints
- Foundry API: proxy auth routes or redirect to auth service
- JWT verification: Foundry verifies access tokens using shared JWT secret or JWKS endpoint
- Test: register via auth service → access Foundry API with token

**Commit:** `feat: integrate SpaceChild Auth with The Foundry`
