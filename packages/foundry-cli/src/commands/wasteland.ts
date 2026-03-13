import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatWanted, formatRigs, formatStats } from "../formatters.js";

export function registerWastelandCommands(program: Command): void {
  const wasteland = program.command("wasteland").description("Wasteland data");

  wasteland
    .command("wanted")
    .description("List wanted items")
    .option("--project <project>", "Filter by project")
    .option("--status <status>", "Filter by status")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getWanted({ project: opts.project, status: opts.status });
        if (opts.pretty) {
          console.log(formatWanted(data));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  wasteland
    .command("rigs")
    .description("List rigs")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getRigs();
        if (opts.pretty) {
          console.log(formatRigs(data));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  wasteland
    .command("stats")
    .description("Wasteland statistics")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getStats();
        if (opts.pretty) {
          console.log(formatStats(data));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
