import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatSpaces } from "../formatters.js";

export function registerSpacesCommands(program: Command): void {
  const spaces = program.command("spaces").description("Manage spaces");

  spaces
    .command("list")
    .description("List all spaces")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listSpaces();
        if (opts.pretty) {
          console.log(formatSpaces(data));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  spaces
    .command("get")
    .description("Get a space with recent posts")
    .argument("<id>", "Space ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getSpace(id);
        if (opts.pretty) {
          console.log(`Space: ${data.name} (${data.type})`);
          console.log(`ID: ${data.id}`);
          if (data.description) console.log(`Description: ${data.description}`);
          if (data.posts?.length) {
            console.log(`\nRecent posts:`);
            const { formatPosts } = await import("../formatters.js");
            console.log(formatPosts(data.posts));
          }
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  spaces
    .command("create")
    .description("Create a new space")
    .argument("<name>", "Space name")
    .requiredOption("--type <type>", "Space type: forum, chat, or project")
    .option("--desc <description>", "Space description")
    .action(async (name, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.createSpace({ name, type: opts.type, description: opts.desc });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
