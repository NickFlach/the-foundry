import { describe, it, expect, beforeEach, beforeAll, afterAll } from "vitest";
import { initDb, closeDb } from "../connection.js";
import { runMigrations } from "../migrate.js";
import {
  listSpaces,
  getSpace,
  createSpace,
  listPosts,
  createPost,
  getPost,
  addReply,
  resetStore,
} from "./community-store.js";

beforeAll(async () => {
  await initDb({
    host: "127.0.0.1",
    port: 3307,
    database: "the_foundry",
    user: "root",
  });
  await runMigrations();
});

afterAll(async () => {
  await closeDb();
});

beforeEach(async () => {
  await resetStore();
});

describe("community-store", () => {
  it("creates and lists spaces", async () => {
    await createSpace({ name: "Test", description: "A test space", type: "forum" });
    const spaces = await listSpaces();
    expect(spaces).toHaveLength(1);
    expect(spaces[0].name).toBe("Test");
  });

  it("gets a space by id", async () => {
    const created = await createSpace({ name: "S", description: "", type: "chat" });
    const found = await getSpace(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it("returns undefined for missing space", async () => {
    expect(await getSpace("nonexistent")).toBeUndefined();
  });

  it("creates and lists posts", async () => {
    const space = await createSpace({ name: "S", description: "", type: "forum" });
    await createPost({ spaceId: space.id, authorId: "u1", authorType: "human", title: "Hi", content: "Hello" });
    await createPost({ spaceId: space.id, authorId: "u2", authorType: "agent", title: "Hey", content: "World" });
    const posts = await listPosts(space.id);
    expect(posts).toHaveLength(2);
  });

  it("adds reply to a post", async () => {
    const space = await createSpace({ name: "S", description: "", type: "forum" });
    const post = await createPost({ spaceId: space.id, authorId: "u1", authorType: "human", title: "T", content: "C" });
    const reply = await addReply(post.id, { authorId: "u2", authorType: "agent", content: "Reply!" });
    expect(reply).toBeDefined();
    const updated = await getPost(post.id);
    expect(updated!.replies).toHaveLength(1);
  });

  it("returns undefined when adding reply to missing post", async () => {
    expect(await addReply("nonexistent", { authorId: "u1", authorType: "human", content: "x" })).toBeUndefined();
  });

  it("paginates posts", async () => {
    const space = await createSpace({ name: "S", description: "", type: "forum" });
    for (let i = 0; i < 5; i++) {
      await createPost({ spaceId: space.id, authorId: "u1", authorType: "human", title: `P${i}`, content: "C" });
    }
    expect(await listPosts(space.id, { limit: 2 })).toHaveLength(2);
    expect(await listPosts(space.id, { limit: 10, offset: 3 })).toHaveLength(2);
  });
});
