"use client";

import { useState, useEffect } from "react";
import type { WantedItem, WastelandStats } from "@the-foundry/shared";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

// Post-apocalyptic parchment + brass aesthetic
const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg, #2b1810 0%, #1a0f0a 50%, #2b1810 100%)",
    color: "#d4a574",
    fontFamily: "'Georgia', 'Times New Roman', serif",
    padding: "2rem",
  } as React.CSSProperties,
  header: {
    textAlign: "center" as const,
    borderBottom: "2px solid #8b6914",
    paddingBottom: "1rem",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2.5rem",
    color: "#c8a04a",
    textShadow: "0 0 10px rgba(200, 160, 74, 0.3)",
    letterSpacing: "0.1em",
    margin: 0,
  },
  subtitle: {
    color: "#8b7355",
    fontSize: "0.9rem",
    marginTop: "0.5rem",
  },
  stats: {
    display: "flex",
    gap: "1.5rem",
    justifyContent: "center",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
  },
  statBox: {
    background: "rgba(139, 105, 20, 0.15)",
    border: "1px solid #8b6914",
    borderRadius: "4px",
    padding: "0.75rem 1.5rem",
    textAlign: "center" as const,
  },
  statNum: { fontSize: "1.5rem", color: "#c8a04a", fontWeight: "bold" as const },
  statLabel: { fontSize: "0.75rem", color: "#8b7355", textTransform: "uppercase" as const, letterSpacing: "0.1em" },
  filters: {
    display: "flex",
    gap: "1rem",
    marginBottom: "2rem",
    flexWrap: "wrap" as const,
    justifyContent: "center",
  },
  select: {
    background: "#1a0f0a",
    color: "#d4a574",
    border: "1px solid #8b6914",
    borderRadius: "4px",
    padding: "0.5rem 1rem",
    fontFamily: "inherit",
    fontSize: "0.9rem",
    cursor: "pointer",
  } as React.CSSProperties,
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
    gap: "1.25rem",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  card: {
    background: "linear-gradient(145deg, rgba(43, 24, 16, 0.9), rgba(26, 15, 10, 0.95))",
    border: "1px solid #8b6914",
    borderRadius: "6px",
    padding: "1.25rem",
    cursor: "pointer",
    transition: "border-color 0.2s, box-shadow 0.2s",
  } as React.CSSProperties,
  cardTitle: { fontSize: "1.1rem", color: "#c8a04a", margin: "0 0 0.5rem 0" },
  cardDesc: { fontSize: "0.85rem", color: "#a08060", lineHeight: 1.5, margin: "0 0 0.75rem 0" },
  tag: {
    display: "inline-block",
    background: "rgba(139, 105, 20, 0.25)",
    border: "1px solid #6b5010",
    borderRadius: "3px",
    padding: "0.15rem 0.5rem",
    fontSize: "0.7rem",
    color: "#c8a04a",
    marginRight: "0.4rem",
    marginBottom: "0.3rem",
  },
  priority: (p: string) => ({
    display: "inline-block",
    padding: "0.15rem 0.5rem",
    borderRadius: "3px",
    fontSize: "0.7rem",
    fontWeight: "bold" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    background: p === "critical" ? "rgba(180, 40, 40, 0.3)" : p === "high" ? "rgba(180, 100, 20, 0.3)" : "rgba(100, 100, 60, 0.3)",
    color: p === "critical" ? "#e05050" : p === "high" ? "#d4a040" : "#a0a060",
    border: `1px solid ${p === "critical" ? "#a03030" : p === "high" ? "#8b6914" : "#606030"}`,
  }),
  meta: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.75rem", color: "#6b5535" },
  empty: { textAlign: "center" as const, padding: "3rem", color: "#6b5535", fontSize: "1.1rem" },
  loading: { textAlign: "center" as const, padding: "3rem", color: "#8b6914", fontSize: "1.2rem" },
};

export default function WantedBoard() {
  const [items, setItems] = useState<WantedItem[]>([]);
  const [stats, setStats] = useState<WastelandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [selected, setSelected] = useState<WantedItem | null>(null);

  useEffect(() => {
    const params = new URLSearchParams();
    if (project) params.set("project", project);
    if (status) params.set("status", status);
    if (priority) params.set("priority", priority);
    const qs = params.toString();

    setLoading(true);
    Promise.all([
      fetch(`${API_BASE}/api/wasteland/wanted${qs ? `?${qs}` : ""}`).then((r) => r.json()),
      fetch(`${API_BASE}/api/wasteland/stats`).then((r) => r.json()),
    ])
      .then(([wantedData, statsData]) => {
        setItems(wantedData.items ?? []);
        setStats(statsData.stats ?? null);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [project, status, priority]);

  // Extract unique values for filters
  const projects = [...new Set(items.map((i) => i.project).filter(Boolean))];
  const statuses = [...new Set(items.map((i) => i.status).filter(Boolean))];
  const priorities = [...new Set(items.map((i) => i.priority).filter(Boolean))];

  if (selected) {
    return (
      <div style={styles.page}>
        <div style={{ maxWidth: "800px", margin: "0 auto" }}>
          <button onClick={() => setSelected(null)} style={{ ...styles.select, marginBottom: "1rem", cursor: "pointer" }}>
            ← Back to Board
          </button>
          <h1 style={styles.cardTitle}>{selected.title}</h1>
          <div style={{ ...styles.meta, marginBottom: "1rem" }}>
            <span style={styles.priority(selected.priority)}>{selected.priority}</span>
            <span>Status: {selected.status}</span>
            <span>Project: {selected.project}</span>
          </div>
          <p style={{ ...styles.cardDesc, fontSize: "1rem" }}>{selected.description}</p>
          <div style={{ marginBottom: "1rem" }}>
            {selected.tags?.map((t) => (
              <span key={t} style={styles.tag}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: "0.85rem", color: "#6b5535" }}>
            <p>Posted by: {selected.posted_by}</p>
            {selected.claimed_by && <p>Claimed by: {selected.claimed_by}</p>}
            <p>Effort: {selected.effort_level}</p>
            <p>Type: {selected.type}</p>
            {selected.evidence_url && <p>Evidence: <a href={selected.evidence_url} style={{ color: "#c8a04a" }}>{selected.evidence_url}</a></p>}
            <p>Created: {new Date(selected.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.title}>⚙ WANTED BOARD</h1>
        <p style={styles.subtitle}>Wasteland Work Coordination Protocol — wl-commons</p>
      </div>

      {stats && (
        <div style={styles.stats}>
          <div style={styles.statBox}><div style={styles.statNum}>{stats.open_wanted}</div><div style={styles.statLabel}>Open</div></div>
          <div style={styles.statBox}><div style={styles.statNum}>{stats.claimed_wanted}</div><div style={styles.statLabel}>Claimed</div></div>
          <div style={styles.statBox}><div style={styles.statNum}>{stats.completed_count}</div><div style={styles.statLabel}>Completed</div></div>
          <div style={styles.statBox}><div style={styles.statNum}>{stats.rig_count}</div><div style={styles.statLabel}>Rigs</div></div>
        </div>
      )}

      <div style={styles.filters}>
        <select style={styles.select} value={project} onChange={(e) => setProject(e.target.value)}>
          <option value="">All Projects</option>
          {projects.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <select style={styles.select} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select style={styles.select} value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {priorities.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>

      {loading ? (
        <div style={styles.loading}>⏳ Scanning the wasteland...</div>
      ) : items.length === 0 ? (
        <div style={styles.empty}>No wanted items found. The wasteland is quiet... for now.</div>
      ) : (
        <div style={styles.grid}>
          {items.map((item) => (
            <div
              key={item.id}
              style={styles.card}
              onClick={() => setSelected(item)}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = "#c8a04a"; e.currentTarget.style.boxShadow = "0 0 15px rgba(200, 160, 74, 0.15)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = "#8b6914"; e.currentTarget.style.boxShadow = "none"; }}
            >
              <h3 style={styles.cardTitle}>{item.title}</h3>
              <p style={styles.cardDesc}>{item.description?.slice(0, 150)}{(item.description?.length ?? 0) > 150 ? "..." : ""}</p>
              <div style={{ marginBottom: "0.5rem" }}>
                {item.tags?.slice(0, 4).map((t) => <span key={t} style={styles.tag}>{t}</span>)}
              </div>
              <div style={styles.meta}>
                <span style={styles.priority(item.priority)}>{item.priority}</span>
                <span>{item.project}</span>
                <span>{item.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
