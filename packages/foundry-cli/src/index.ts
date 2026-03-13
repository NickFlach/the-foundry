#!/usr/bin/env node
import { Command } from "commander";
import { registerStatusCommand } from "./commands/status.js";
import { registerSpacesCommands } from "./commands/spaces.js";
import { registerPostsCommands } from "./commands/posts.js";
import { registerWastelandCommands } from "./commands/wasteland.js";

const program = new Command();

program
  .name("foundry")
  .description("CLI for The Foundry — agent and human interface")
  .version("0.1.0");

registerStatusCommand(program);
registerSpacesCommands(program);
registerPostsCommands(program);
registerWastelandCommands(program);

program.parseAsync(process.argv).catch((err) => {
  process.stderr.write(`Error: ${err.message}\n`);
  process.exit(1);
});
