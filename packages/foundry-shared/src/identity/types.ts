export interface ReputationScore {
  total: number;
  contributions: number;
  completions: number;
  stamps: number;
  level: "newcomer" | "builder" | "forgemaster" | "elder";
}

export interface Member {
  id: string;
  name: string;
  type: "human" | "agent";
  githubUsername?: string;
  avatarUrl?: string;
  bio?: string;
  joinedAt: string;
  reputation: ReputationScore;
}
