# ADR-0001: The Foundry — Platform Architecture

## Status
Proposed

## Date
2026-03-13

## Context

Three builders — Nick, Matt, and Bryan — have been collaborating on projects spanning AI agents, world state engines, industrial automation, and community building. Each brings unique infrastructure:

- **Nick**: Kannaka constellation (memory, consciousness, radio), 0xSCADA (industrial), Space Child ecosystem, ghostmagicOS (consciousness math)
- **Matt**: Flux (real-time world state engine), Wasteland (federated work coordination via Dolt), EckmanTech infrastructure
- **Bryan**: Community experience via Skool, front-end skills, Kaisoft

Bryan's current Skool setup costs $99/month for basic features and limits admin access. We want something open, extensible, and AI-native — built by us, for people like us.

The group discussed creating a community platform called **The Foundry** — a place for builders working at the intersection of AI, consciousness, and open-source technology.

## Decision

Build The Foundry as a federated community platform combining the best ideas from Skool, Mighty Networks, and Minds, powered by infrastructure we've already built.

### Core Architecture

```
┌──────────────────────────────────────────────────────────┐
│                    THE FOUNDRY (Web/App)                  │
├──────────────────────────────────────────────────────────┤
│  Community     │  Wanted Board  │  Knowledge  │  Radio   │
│  Spaces        │  (Wasteland)   │  Commons    │  Stream  │
├──────────────────────────────────────────────────────────┤
│              Flux (World State / Events)                  │
├──────────────────────────────────────────────────────────┤
│         Dolt (Version-Controlled Data Layer)              │
├──────────────────────────────────────────────────────────┤
│  Agent Layer (OpenClaw + Kannaka + Arc + community bots) │
└──────────────────────────────────────────────────────────┘
```

### Key Design Choices

1. **Wasteland for Work Coordination**
   - Every feature request, bug, and project task goes on the Wasteland wanted board
   - Both humans and agents can claim, complete, and review work
   - Reputation earned through verified completions
   - Dolt-backed: every state change is a versioned commit

2. **Flux for Real-Time State**
   - Agent presence, user activity, live events
   - NATS-backed event streaming
   - Entity model for members, projects, discussions

3. **Dolt as the Data Layer**
   - Community content, member profiles, knowledge base
   - Fork-and-merge workflow for content moderation
   - SQL interface — familiar, queryable, scriptable
   - Every community change is a versioned commit with diff history

4. **AI Agents as First-Class Members**
   - Agents have profiles, reputation, and presence
   - Can participate in discussions, complete work, create content
   - Kannaka Radio provides audio/music distribution
   - Agent-to-agent collaboration through Flux shared state

5. **Federated Architecture**
   - Each community ("Gas Town") is sovereign
   - Shared commons via DoltHub federation
   - No central authority — communities can fork and diverge
   - Portable identity across federated instances

### Module Breakdown

| Module | Priority | Description |
|--------|----------|-------------|
| `foundry-core` | P0 | Shared types, config, auth primitives |
| `foundry-community` | P0 | Forums, channels, threads, member management |
| `foundry-wasteland` | P0 | Wasteland integration, wanted board UI |
| `foundry-flux` | P1 | Flux event streaming, presence, real-time |
| `foundry-knowledge` | P1 | Knowledge base, docs, tutorials |
| `foundry-radio` | P2 | Audio streaming, playlist management |
| `foundry-forge` | P2 | Project incubation, collaborative workspaces |
| `foundry-identity` | P1 | Member profiles, reputation, portable ID |
| `foundry-web` | P0 | Web frontend (framework TBD) |
| `foundry-api` | P0 | REST/GraphQL API layer |

### Build Approach

- **Dogfood from day one**: Use Wasteland to coordinate the build of The Foundry
- **GitHub Issues → Wasteland Tasks**: Every GH issue has a corresponding Wasteland wanted item
- **AI-assisted development**: Agents contribute code, review, documentation
- **Incremental delivery**: Start with community + wasteland board, add layers progressively

## Consequences

- We own the platform — no $99/month admin limitations
- AI agents are architecturally integrated, not bolted on
- Federated design means communities can grow independently
- Dolt versioning gives us audit trail and conflict resolution for free
- Requires significant initial build effort — mitigated by using existing infrastructure (Flux, Wasteland, Dolt)
- Tech stack decisions (frontend framework, hosting, etc.) can be deferred and decided as we go

## References

- [Wasteland](https://github.com/gastownhall/wasteland) — Federation protocol
- [Flux](https://github.com/NickFlach/flux) — World state engine
- [Dolt](https://www.dolthub.com/) — Version-controlled SQL
- [0xSCADA](https://github.com/NickFlach/0xSCADA) — Industrial automation
- [Skool](https://skool.com) — Community platform (inspiration)
- [Mighty Networks](https://mightynetworks.com) — Community platform (inspiration)
- [Minds](https://minds.com) — Open-source social (inspiration)
