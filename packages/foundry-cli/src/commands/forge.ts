import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatTable } from "../formatters.js";

export function registerForgeCommands(program: Command): void {
  const forge = program.command("forge").description("The Forge — project incubation");

  forge
    .command("list")
    .description("List projects")
    .option("--status <status>", "Filter by status")
    .option("--tag <tag>", "Filter by tag")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listForgeProjects({ status: opts.status, tag: opts.tag });
        if (opts.pretty) {
          console.log(formatTable(data.map((p: any) => ({
            id: p.id?.substring(0, 8) ?? "", name: p.name, status: p.status, owner: p.owner, tags: p.tags?.join(", ") ?? "",
          })), ["id", "name", "status", "owner", "tags"]));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  forge
    .command("get")
    .description("Get project details with milestones")
    .argument("<id>", "Project ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const p = await client.getForgeProject(id);
        if (opts.pretty) {
          console.log(`${p.name} [${p.status}] — ${p.owner}`);
          console.log(`  ${p.description}`);
          console.log(`  Contributors: ${p.contributors?.join(", ")}`);
          if (p.milestones?.length) {
            console.log("  Milestones:");
            for (const m of p.milestones) console.log(`    • ${m.title} [${m.status}]${m.dueDate ? ` due ${m.dueDate}` : ""}`);
          }
        } else {
          console.log(JSON.stringify(p, null, 2));
        }
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  forge
    .command("create")
    .description("Create a project")
    .argument("<name>", "Project name")
    .requiredOption("--desc <description>", "Description")
    .option("--repo <url>", "Repository URL")
    .option("--tags <tags>", "Comma-separated tags", "")
    .action(async (name, opts) => {
      const client = new FoundryClient();
      try {
        const tags = opts.tags ? opts.tags.split(",").map((s: string) => s.trim()).filter(Boolean) : [];
        const data = await client.createForgeProject({ name, description: opts.desc, owner: "nick", repoUrl: opts.repo, tags });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  forge
    .command("update")
    .description("Update a project")
    .argument("<id>", "Project ID")
    .option("--status <status>", "New status")
    .option("--name <name>", "New name")
    .option("--desc <description>", "New description")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const update: any = {};
        if (opts.status) update.status = opts.status;
        if (opts.name) update.name = opts.name;
        if (opts.desc) update.description = opts.desc;
        const data = await client.updateForgeProject(id, update);
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  forge
    .command("milestone")
    .description("Add a milestone to a project")
    .argument("<projectId>", "Project ID")
    .requiredOption("--title <title>", "Milestone title")
    .option("--desc <description>", "Description", "")
    .option("--due <date>", "Due date")
    .action(async (projectId, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.addForgeMilestone(projectId, { title: opts.title, description: opts.desc, dueDate: opts.due });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });

  forge
    .command("add-contributor")
    .description("Add a contributor to a project")
    .argument("<projectId>", "Project ID")
    .argument("<memberId>", "Member ID")
    .action(async (projectId, memberId) => {
      const client = new FoundryClient();
      try {
        const data = await client.addForgeContributor(projectId, memberId);
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) { process.stderr.write(`Error: ${err.message}\n`); process.exit(1); }
    });
}
