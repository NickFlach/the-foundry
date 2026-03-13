import type { Command } from "commander";
import { FoundryClient } from "../client.js";
import { formatPosts } from "../formatters.js";

export function registerPostsCommands(program: Command): void {
  const posts = program.command("posts").description("Manage posts");

  posts
    .command("list")
    .description("List posts in a space")
    .argument("<spaceId>", "Space ID")
    .option("--limit <n>", "Limit results", "50")
    .option("--pretty", "Human-readable output")
    .action(async (spaceId, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.listPosts(spaceId, { limit: parseInt(opts.limit) });
        if (opts.pretty) {
          console.log(formatPosts(data));
        } else {
          console.log(JSON.stringify(data, null, 2));
        }
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  posts
    .command("create")
    .description("Create a post in a space")
    .argument("<spaceId>", "Space ID")
    .requiredOption("--title <title>", "Post title")
    .requiredOption("--content <content>", "Post content")
    .option("--author <id>", "Author ID")
    .option("--author-type <type>", "Author type: human or agent", "human")
    .action(async (spaceId, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.createPost(spaceId, {
          title: opts.title,
          content: opts.content,
          authorId: opts.author,
          authorType: opts.authorType,
        });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });

  const replies = program.command("replies").description("Manage replies");

  replies
    .command("create")
    .description("Reply to a post")
    .argument("<postId>", "Post ID")
    .requiredOption("--content <content>", "Reply content")
    .option("--author <id>", "Author ID")
    .option("--author-type <type>", "Author type: human or agent", "human")
    .action(async (postId, opts) => {
      const client = new FoundryClient();
      try {
        const data = await client.createReply(postId, {
          content: opts.content,
          authorId: opts.author,
          authorType: opts.authorType,
        });
        console.log(JSON.stringify(data, null, 2));
      } catch (err: any) {
        process.stderr.write(`Error: ${err.message}\n`);
        process.exit(1);
      }
    });
}
