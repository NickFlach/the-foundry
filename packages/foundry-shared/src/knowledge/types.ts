import type { AuthorType } from "../community/types.js";

export type KnowledgeCategory = "tutorial" | "reference" | "research" | "guide" | "discussion";

export interface Article {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: KnowledgeCategory;
  tags: string[];
  authorId: string;
  authorType: AuthorType;
  createdAt: string;
  updatedAt: string;
  version: number;
}

export interface ArticleRevision {
  id: string;
  articleId: string;
  content: string;
  authorId: string;
  createdAt: string;
  changeSummary: string;
}
