import type { Command } from "commander";
import { FoundryClient } from "../client.js";

export function registerStatusCommand(program: Command): void {
  program
    .command("status")
    .description("Health check and basic stats")
    .action(async () => {
      const client = new FoundryClient();
      try {
        const health = await client.health();
        const spaces = await client.listSpaces();
        const result = { ...health, spaceCount: spaces.length };
        console.log(JSON.stringify(result, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
