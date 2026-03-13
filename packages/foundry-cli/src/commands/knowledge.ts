import type { Command } from "commander";
import { FoundryClient } from "../client.js";

function formatArticle(a: any): string {
  const tags = a.tags?.length ? ` [${a.tags.join(", ")}]` : "";
  return `📄 ${a.title} (v${a.version})\n   ID: ${a.id}\n   Slug: ${a.slug}\n   Category: ${a.category}${tags}\n   Author: ${a.authorId} (${a.authorType})\n   Updated: ${a.updatedAt}`;
}

function formatArticleList(articles: any[]): string {
  if (!articles.length) return "No articles found.";
  return articles.map(formatArticle).join("\n\n");
}

export function registerKnowledgeCommands(program: Command): void {
  const knowledge = program.command("knowledge").description("Knowledge commons — articles and documentation");

  knowledge
    .command("list")
    .description("List articles")
    .option("--category <category>", "Filter by category")
    .option("--tag <tag>", "Filter by tag")
    .option("--pretty", "Human-readable output")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const filters: any = {};
        if (opts.category) filters.category = opts.category;
        if (opts.tag) filters.tag = opts.tag;
        const data = await client.listArticles(Object.keys(filters).length ? filters : undefined);
        console.log(opts.pretty ? formatArticleList(data) : JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  knowledge
    .command("get")
    .description("Get an article by ID or slug")
    .argument("<idOrSlug>", "Article ID or slug")
    .option("--pretty", "Human-readable output")
    .action(async (idOrSlug, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getArticle(idOrSlug);
        if (opts.pretty) {
          console.log(formatArticle(data));
          console.log(`\n${data.content}`);
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  knowledge
    .command("create")
    .description("Create a new article")
    .requiredOption("--title <title>", "Article title")
    .requiredOption("--content <content>", "Article content (markdown)")
    .requiredOption("--category <category>", "Category: tutorial, reference, research, guide, discussion")
    .option("--tags <tags>", "Comma-separated tags")
    .option("--author <authorId>", "Author ID")
    .option("--author-type <authorType>", "Author type: human or agent", "human")
    .action(async (opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.createArticle({
          title: opts.title,
          content: opts.content,
          category: opts.category,
          tags: opts.tags ? opts.tags.split(",").map((t: string) => t.trim()) : undefined,
          authorId: opts.author,
          authorType: opts.authorType,
        });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  knowledge
    .command("update")
    .description("Update an article")
    .argument("<id>", "Article ID")
    .requiredOption("--content <content>", "New content")
    .option("--summary <summary>", "Change summary")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.updateArticle(id, {
          content: opts.content,
          changeSummary: opts.summary,
        });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  knowledge
    .command("search")
    .description("Search articles")
    .argument("<query>", "Search query")
    .option("--pretty", "Human-readable output")
    .action(async (query, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.searchArticles(query);
        console.log(opts.pretty ? formatArticleList(data) : JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  knowledge
    .command("revisions")
    .description("Get revision history for an article")
    .argument("<id>", "Article ID")
    .option("--pretty", "Human-readable output")
    .action(async (id, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.getRevisions(id);
        if (opts.pretty) {
          if (!data.length) {
            console.log("No revisions yet.");
          } else {
            data.forEach((r: any, i: number) => {
              console.log(`Revision ${i + 1} — ${r.createdAt}`);
              console.log(`  Author: ${r.authorId}`);
              if (r.changeSummary) console.log(`  Summary: ${r.changeSummary}`);
              console.log();
            });
          }
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
