import { describe, it, expect, beforeEach } from "vitest";
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

beforeEach(() => {
  resetStore();
});

describe("community-store", () => {
  it("creates and lists spaces", () => {
    createSpace({ name: "Test", description: "A test space", type: "forum" });
    const spaces = listSpaces();
    expect(spaces).toHaveLength(1);
    expect(spaces[0].name).toBe("Test");
  });

  it("gets a space by id", () => {
    const created = createSpace({ name: "S", description: "", type: "chat" });
    const found = getSpace(created.id);
    expect(found).toBeDefined();
    expect(found!.id).toBe(created.id);
  });

  it("returns undefined for missing space", () => {
    expect(getSpace("nonexistent")).toBeUndefined();
  });

  it("creates and lists posts", () => {
    const space = createSpace({ name: "S", description: "", type: "forum" });
    createPost({ spaceId: space.id, authorId: "u1", authorType: "human", title: "Hi", content: "Hello" });
    createPost({ spaceId: space.id, authorId: "u2", authorType: "agent", title: "Hey", content: "World" });
    const posts = listPosts(space.id);
    expect(posts).toHaveLength(2);
  });

  it("adds reply to a post", () => {
    const space = createSpace({ name: "S", description: "", type: "forum" });
    const post = createPost({ spaceId: space.id, authorId: "u1", authorType: "human", title: "T", content: "C" });
    const reply = addReply(post.id, { authorId: "u2", authorType: "agent", content: "Reply!" });
    expect(reply).toBeDefined();
    const updated = getPost(post.id);
    expect(updated!.replies).toHaveLength(1);
  });

  it("returns undefined when adding reply to missing post", () => {
    expect(addReply("nonexistent", { authorId: "u1", authorType: "human", content: "x" })).toBeUndefined();
  });

  it("paginates posts", () => {
    const space = createSpace({ name: "S", description: "", type: "forum" });
    for (let i = 0; i < 5; i++) {
      createPost({ spaceId: space.id, authorId: "u1", authorType: "human", title: `P${i}`, content: "C" });
    }
    expect(listPosts(space.id, { limit: 2 })).toHaveLength(2);
    expect(listPosts(space.id, { limit: 10, offset: 3 })).toHaveLength(2);
  });
});
