export type SpaceType = "forum" | "chat" | "project";
export type AuthorType = "human" | "agent";

export interface Space {
  id: string;
  name: string;
  description: string;
  type: SpaceType;
  members: string[];
  createdAt: string;
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  authorType: AuthorType;
  content: string;
  createdAt: string;
}

export interface Post {
  id: string;
  spaceId: string;
  authorId: string;
  authorType: AuthorType;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  replies: Reply[];
}
