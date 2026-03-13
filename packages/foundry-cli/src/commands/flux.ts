import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatTable } from "../formatters.js";

export function registerFluxCommands(program: Command): void {
  const flux = program.command("flux").description("Flux world state commands");

  flux
    .command("presence")
    .description("Show who's online")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getPresence();
        if (opts.pretty) {
          console.log(
            formatTable(
              data.map((e: any) => ({
                id: e.id,
                type: e.type,
                updated: e.updatedAt ?? "",
              })),
              ["id", "type", "updated"],
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

  flux
    .command("entity")
    .description("Get a Flux entity by ID")
    .argument("<id>", "Entity ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const e = await client.getFluxEntity(id);
        if (opts.pretty) {
          console.log(`${e.id} (${e.type})`);
          console.log(`  Properties: ${JSON.stringify(e.properties)}`);
          console.log(`  Updated: ${e.updatedAt}`);
        } else {
          console.log(JSON.stringify(e, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
