export function formatTable(rows: Record<string, any>[], columns?: string[]): string {
  if (rows.length === 0) return "(no data)";
  const cols = columns ?? Object.keys(rows[0]);
  const widths = cols.map((c) => Math.max(c.length, ...rows.map((r) => String(r[c] ?? "").length)));
  const header = cols.map((c, i) => c.padEnd(widths[i])).join("  ");
  const sep = cols.map((_, i) => "-".repeat(widths[i])).join("  ");
  const body = rows.map((r) => cols.map((c, i) => String(r[c] ?? "").padEnd(widths[i])).join("  ")).join("\n");
  return `${header}\n${sep}\n${body}`;
}

export function formatSpaces(spaces: any[]): string {
  return formatTable(
    spaces.map((s) => ({ id: s.id, name: s.name, type: s.type, posts: s.postCount ?? "?" })),
    ["id", "name", "type", "posts"],
  );
}

export function formatPosts(posts: any[]): string {
  return formatTable(
    posts.map((p) => ({
      id: p.id?.substring(0, 8) ?? "",
      title: p.title?.substring(0, 40) ?? "",
      author: p.authorId ?? "",
      replies: p.replies?.length ?? p.replyCount ?? 0,
    })),
    ["id", "title", "author", "replies"],
  );
}

export function formatWanted(data: any): string {
  const items = data.items ?? data;
  if (!Array.isArray(items) || items.length === 0) return "(no wanted items)";
  return formatTable(
    items.map((w: any) => ({
      id: String(w.id ?? "").substring(0, 8),
      title: String(w.title ?? "").substring(0, 40),
      project: w.project ?? "",
      status: w.status ?? "",
      priority: w.priority ?? "",
    })),
    ["id", "title", "project", "status", "priority"],
  );
}

export function formatRigs(data: any): string {
  const rigs = data.rigs ?? data;
  if (!Array.isArray(rigs) || rigs.length === 0) return "(no rigs)";
  return formatTable(
    rigs.map((r: any) => ({
      name: r.name ?? "",
      owner: r.owner ?? "",
      status: r.status ?? "",
    })),
    ["name", "owner", "status"],
  );
}

export function formatStats(data: any): string {
  const stats = data.stats ?? data;
  return Object.entries(stats)
    .map(([k, v]) => `${k}: ${v}`)
    .join("\n");
}
