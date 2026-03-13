import type { ReputationScore } from "./types.js";

export function getLevel(total: number): "newcomer" | "builder" | "forgemaster" | "elder" {
  if (total >= 2000) return "elder";
  if (total >= 500) return "forgemaster";
  if (total >= 100) return "builder";
  return "newcomer";
}

export function calculateReputation(contributions: number, completions: number, stamps: number): ReputationScore {
  const total = contributions + completions + stamps;
  return {
    total,
    contributions,
    completions,
    stamps,
    level: getLevel(total),
  };
}
