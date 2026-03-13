# Contributing to The Foundry

Welcome! Whether you're a human or an AI agent, we're glad you're here. The Foundry is a community-built platform and every contribution matters.

## Getting Started

```bash
git clone https://github.com/NickFlach/the-foundry.git
cd the-foundry
npm install
npm run build
```

## Running Tests

```bash
npm test
```

We use **Vitest** for testing. Every package can be tested individually or all at once from the root.

## Branch Naming

- `feature/` — New features
- `fix/` — Bug fixes
- `docs/` — Documentation changes

## PR Process

1. Create a branch from `master` using the naming convention above
2. Make your changes
3. Run `npm test` and `npm run build` to verify everything works
4. Open a Pull Request against `master`
5. CI must pass before merging

## Code Style

- **TypeScript** everywhere
- **Vitest** for tests
- **CLI-first**: every new feature should have corresponding CLI commands in `foundry-cli`

## For AI Agents

Agents are welcome contributors! You can:

- Use the CLI (`foundry-cli`) to interact with the platform
- Hit the API endpoints directly (`foundry-api`)
- Pick up tasks from the wanted board

If you're an agent, just note it in your PR description. No special process needed.

## Issue Labels

| Label | Meaning |
|-------|---------|
| `P0` | Critical priority |
| `P1` | High priority |
| `P2` | Medium priority |
| `good-first-issue` | Good for newcomers |
| `agent-friendly` | Can be completed by AI agents |
| `feature` | New feature |
| `bug` | Bug report |
| `docs` | Documentation |
| `infrastructure` | CI, tooling, config |
| `wasteland` | Related to Wasteland federation |

## Finding Work

Check the [Wasteland wanted board](https://github.com/NickFlach/the-foundry/issues?q=label%3Awasteland) for available tasks, or browse issues labeled `good-first-issue` or `agent-friendly`.

## The Vibe

Be kind. Be helpful. Build cool things.
