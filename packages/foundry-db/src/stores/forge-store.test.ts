import { describe, it, expect, beforeEach } from "vitest";
import {
  createProject, getProject, listProjects, updateProject,
  addContributor, addMilestone, getMilestones, updateMilestone,
  resetForgeStore,
} from "./forge-store.js";

beforeEach(() => {
  resetForgeStore();
});

describe("forge-store", () => {
  it("seeds with The Foundry project and 2 milestones", () => {
    const projects = listProjects();
    expect(projects).toHaveLength(1);
    expect(projects[0].name).toBe("The Foundry");
    expect(projects[0].status).toBe("active");
    const ms = getMilestones(projects[0].id);
    expect(ms).toHaveLength(2);
    expect(ms.find((m) => m.title === "MVP")!.status).toBe("done");
    expect(ms.find((m) => m.title === "Federation")!.status).toBe("planned");
  });

  it("creates a project", () => {
    const p = createProject({ name: "New", description: "desc", owner: "nick", tags: ["ai"] });
    expect(p.id).toBeDefined();
    expect(p.status).toBe("idea");
    expect(p.contributors).toEqual(["nick"]);
    expect(listProjects()).toHaveLength(2);
  });

  it("updates a project", () => {
    const p = createProject({ name: "Proj", description: "d", owner: "nick" });
    updateProject(p.id, { status: "shipped", tags: ["done"] });
    const updated = getProject(p.id)!;
    expect(updated.status).toBe("shipped");
    expect(updated.tags).toEqual(["done"]);
  });

  it("adds contributors", () => {
    const p = listProjects()[0];
    addContributor(p.id, "matt");
    expect(getProject(p.id)!.contributors).toContain("matt");
    // No duplicates
    addContributor(p.id, "matt");
    expect(getProject(p.id)!.contributors.filter((c) => c === "matt")).toHaveLength(1);
  });

  it("adds and updates milestones", () => {
    const p = listProjects()[0];
    const ms = addMilestone({ projectId: p.id, title: "Beta", description: "Beta release", dueDate: "2026-05-01" });
    expect(ms!.status).toBe("planned");
    updateMilestone(ms!.id, { status: "in-progress" });
    const updated = getMilestones(p.id).find((m) => m.id === ms!.id)!;
    expect(updated.status).toBe("in-progress");
  });

  it("filters projects by status and tag", () => {
    createProject({ name: "Shipped", description: "d", owner: "nick", tags: ["music"] });
    updateProject(listProjects().find((p) => p.name === "Shipped")!.id, { status: "shipped" });
    expect(listProjects({ status: "active" })).toHaveLength(1);
    expect(listProjects({ status: "shipped" })).toHaveLength(1);
    expect(listProjects({ tag: "music" })).toHaveLength(1);
  });

  it("returns undefined for nonexistent items", () => {
    expect(getProject("nope")).toBeUndefined();
    expect(updateProject("nope", {})).toBeUndefined();
    expect(addContributor("nope", "x")).toBeUndefined();
    expect(addMilestone({ projectId: "nope", title: "t", description: "d" })).toBeUndefined();
    expect(updateMilestone("nope", {})).toBeUndefined();
  });
});
