import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatTable } from "../formatters.js";

export function registerMembersCommands(program: Command): void {
  const members = program.command("members").description("Manage members");

  members
    .command("list")
    .description("List all members")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listMembers();
        if (opts.pretty) {
          console.log(
            formatTable(
              data.map((m: any) => ({
                id: m.id?.substring(0, 8) ?? "",
                name: m.name,
                type: m.type,
                level: m.reputation?.level ?? "",
                rep: m.reputation?.total ?? 0,
              })),
              ["id", "name", "type", "level", "rep"],
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

  members
    .command("get")
    .description("Get a member by ID")
    .argument("<id>", "Member ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const m = await client.getMember(id);
        if (opts.pretty) {
          console.log(`${m.name} (${m.type}) — ${m.reputation?.level ?? "newcomer"}`);
          if (m.bio) console.log(`  Bio: ${m.bio}`);
          if (m.githubUsername) console.log(`  GitHub: ${m.githubUsername}`);
          console.log(`  Reputation: ${m.reputation?.total ?? 0}`);
        } else {
          console.log(JSON.stringify(m, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  members
    .command("register")
    .description("Register a new member")
    .argument("<name>", "Member name")
    .requiredOption("--type <type>", "Member type: human or agent")
    .option("--github <username>", "GitHub username")
    .option("--bio <bio>", "Bio")
    .action(async (name, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.createMember({
          name,
          type: opts.type,
          githubUsername: opts.github,
          bio: opts.bio,
        });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
