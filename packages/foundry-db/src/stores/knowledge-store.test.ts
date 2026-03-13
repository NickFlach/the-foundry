import { describe, it, expect, beforeEach } from "vitest";
import {
  createArticle,
  getArticle,
  getArticleBySlug,
  listArticles,
  updateArticle,
  getRevisions,
  searchArticles,
  resetKnowledgeStore,
} from "./knowledge-store.js";

beforeEach(() => {
  resetKnowledgeStore();
});

describe("knowledge-store", () => {
  it("creates an article with auto-generated slug", () => {
    const article = createArticle({
      title: "Hello World",
      content: "# Hello\nWorld",
      category: "tutorial",
      tags: ["test"],
      authorId: "u1",
      authorType: "human",
    });
    expect(article.id).toBeDefined();
    expect(article.slug).toBe("hello-world");
    expect(article.version).toBe(1);
  });

  it("gets article by id", () => {
    const created = createArticle({
      title: "Test",
      content: "Content",
      category: "guide",
      authorId: "u1",
      authorType: "human",
    });
    expect(getArticle(created.id)).toBeDefined();
    expect(getArticle("nonexistent")).toBeUndefined();
  });

  it("gets article by slug", () => {
    createArticle({
      title: "My Great Article",
      content: "Content",
      category: "reference",
      authorId: "u1",
      authorType: "agent",
    });
    const found = getArticleBySlug("my-great-article");
    expect(found).toBeDefined();
    expect(found!.title).toBe("My Great Article");
    expect(getArticleBySlug("nonexistent")).toBeUndefined();
  });

  it("lists articles with category filter", () => {
    createArticle({ title: "A", content: "C", category: "tutorial", authorId: "u1", authorType: "human" });
    createArticle({ title: "B", content: "C", category: "guide", authorId: "u1", authorType: "human" });
    createArticle({ title: "C", content: "C", category: "tutorial", authorId: "u2", authorType: "agent" });
    expect(listArticles({ category: "tutorial" })).toHaveLength(2);
    expect(listArticles({ category: "guide" })).toHaveLength(1);
  });

  it("lists articles with tag filter", () => {
    createArticle({ title: "A", content: "C", category: "tutorial", tags: ["foo", "bar"], authorId: "u1", authorType: "human" });
    createArticle({ title: "B", content: "C", category: "guide", tags: ["baz"], authorId: "u1", authorType: "human" });
    expect(listArticles({ tag: "foo" })).toHaveLength(1);
    expect(listArticles({ tag: "nope" })).toHaveLength(0);
  });

  it("lists articles with authorId filter", () => {
    createArticle({ title: "A", content: "C", category: "tutorial", authorId: "u1", authorType: "human" });
    createArticle({ title: "B", content: "C", category: "guide", authorId: "u2", authorType: "agent" });
    expect(listArticles({ authorId: "u1" })).toHaveLength(1);
  });

  it("updates article and creates revision", () => {
    const article = createArticle({
      title: "Original",
      content: "V1 content",
      category: "tutorial",
      authorId: "u1",
      authorType: "human",
    });
    const updated = updateArticle(article.id, { content: "V2 content", changeSummary: "Updated text" });
    expect(updated).toBeDefined();
    expect(updated!.version).toBe(2);
    expect(updated!.content).toBe("V2 content");

    const revs = getRevisions(article.id);
    expect(revs).toHaveLength(1);
    expect(revs[0].content).toBe("V1 content");
    expect(revs[0].changeSummary).toBe("Updated text");
  });

  it("returns undefined when updating nonexistent article", () => {
    expect(updateArticle("nonexistent", { content: "x" })).toBeUndefined();
  });

  it("searches articles by title and content", () => {
    createArticle({ title: "Flux Guide", content: "How to use flux", category: "tutorial", authorId: "u1", authorType: "human" });
    createArticle({ title: "Other", content: "Unrelated stuff", category: "guide", authorId: "u1", authorType: "human" });
    createArticle({ title: "Advanced", content: "Deep dive into flux internals", category: "research", authorId: "u2", authorType: "agent" });
    expect(searchArticles("flux")).toHaveLength(2);
    expect(searchArticles("unrelated")).toHaveLength(1);
    expect(searchArticles("nonexistent")).toHaveLength(0);
  });

  it("returns empty revisions for article with no updates", () => {
    const article = createArticle({
      title: "Fresh",
      content: "New",
      category: "guide",
      authorId: "u1",
      authorType: "human",
    });
    expect(getRevisions(article.id)).toHaveLength(0);
  });
});
