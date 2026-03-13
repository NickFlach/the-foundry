import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatTable } from "../formatters.js";

export function registerAgentsCommands(program: Command): void {
  const agents = program.command("agents").description("Manage AI agents");

  agents
    .command("list")
    .description("List registered agents")
    .option("--status <status>", "Filter by status")
    .option("--capability <cap>", "Filter by capability")
    .option("--framework <fw>", "Filter by framework")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listAgents({ status: opts.status, capability: opts.capability, framework: opts.framework });
        if (opts.pretty) {
          console.log(
            formatTable(
              data.map((a: any) => ({
                id: a.id?.substring(0, 8) ?? "",
                name: a.name,
                framework: a.framework,
                status: a.status,
                capabilities: a.capabilities?.join(", ") ?? "",
              })),
              ["id", "name", "framework", "status", "capabilities"],
            ),
          );
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  agents
    .command("get")
    .description("Get agent profile and stats")
    .argument("<id>", "Agent ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const a = await client.getAgent(id);
        if (opts.pretty) {
          console.log(`${a.name} (${a.framework}) — ${a.status}`);
          console.log(`  Capabilities: ${a.capabilities?.join(", ")}`);
          console.log(`  Owner: ${a.owner}`);
          if (a.stats) console.log(`  Actions: ${a.stats.totalActions} | Last active: ${a.stats.lastActive ?? "never"}`);
        } else {
          console.log(JSON.stringify(a, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  agents
    .command("register")
    .description("Register a new agent")
    .argument("<name>", "Agent name")
    .requiredOption("--framework <framework>", "Agent framework (openclaw, claude-code, codex, custom)")
    .requiredOption("--owner <owner>", "Owner member ID or name")
    .option("--capabilities <caps>", "Comma-separated capabilities", "")
    .option("--endpoint <url>", "API endpoint")
    .action(async (name, opts) => {
      const client = new FoundryClient();
      try {
        const capabilities = opts.capabilities ? opts.capabilities.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        const data = await client.registerAgent({ name, framework: opts.framework, capabilities, owner: opts.owner, apiEndpoint: opts.endpoint });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  agents
    .command("heartbeat")
    .description("Send a heartbeat (status update)")
    .argument("<id>", "Agent ID")
    .requiredOption("--status <status>", "Status: online, idle, busy, offline")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        await client.updateAgentStatus(id, opts.status);
        console.log(`Status updated to ${opts.status}`);
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  agents
    .command("actions")
    .description("List agent actions")
    .argument("<id>", "Agent ID")
    .option("--limit <n>", "Limit results", "20")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getAgentActions(id, parseInt(opts.limit, 10));
        if (opts.pretty) {
          console.log(
            formatTable(
              data.map((a: any) => ({
                id: a.id?.substring(0, 8) ?? "",
                type: a.actionType,
                target: a.targetId?.substring(0, 8) ?? "",
                time: a.timestamp,
                details: (a.details ?? "").substring(0, 40),
              })),
              ["id", "type", "target", "time", "details"],
            ),
          );
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  agents
    .command("log")
    .description("Log an agent action")
    .argument("<id>", "Agent ID")
    .requiredOption("--action <type>", "Action type: post, reply, article, claim, complete, review")
    .requiredOption("--target <targetId>", "Target ID")
    .option("--details <details>", "Action details")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.logAgentAction(id, { actionType: opts.action, targetId: opts.target, details: opts.details });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
