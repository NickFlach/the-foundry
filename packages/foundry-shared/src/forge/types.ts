export type ProjectStatus = "idea" | "active" | "shipped" | "archived";
export type MilestoneStatus = "planned" | "in-progress" | "done";

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  owner: string;
  contributors: string[];
  tags: string[];
  repoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Milestone {
  id: string;
  projectId: string;
  title: string;
  description: string;
  status: MilestoneStatus;
  dueDate?: string;
  completedAt?: string;
}
