import { describe, it, expect } from "vitest";
import { calculateReputation, getLevel } from "./reputation.js";

describe("reputation", () => {
  it("calculates total as sum of inputs", () => {
    const r = calculateReputation(10, 20, 30);
    expect(r.total).toBe(60);
    expect(r.contributions).toBe(10);
    expect(r.completions).toBe(20);
    expect(r.stamps).toBe(30);
  });

  it("assigns newcomer level for 0-99", () => {
    expect(calculateReputation(10, 20, 30).level).toBe("newcomer");
    expect(getLevel(0)).toBe("newcomer");
    expect(getLevel(99)).toBe("newcomer");
  });

  it("assigns builder level for 100-499", () => {
    expect(getLevel(100)).toBe("builder");
    expect(getLevel(499)).toBe("builder");
    expect(calculateReputation(50, 30, 20).level).toBe("builder");
  });

  it("assigns forgemaster level for 500-1999", () => {
    expect(getLevel(500)).toBe("forgemaster");
    expect(getLevel(1999)).toBe("forgemaster");
  });

  it("assigns elder level for 2000+", () => {
    expect(getLevel(2000)).toBe("elder");
    expect(getLevel(10000)).toBe("elder");
    expect(calculateReputation(1000, 500, 500).level).toBe("elder");
  });

  it("handles zero inputs", () => {
    const r = calculateReputation(0, 0, 0);
    expect(r.total).toBe(0);
    expect(r.level).toBe("newcomer");
  });
});
