"use client";

import { useState, useEffect } from "react";
import type { Space } from "@the-foundry/shared";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const cardStyle: React.CSSProperties = {
  background: "#1a0e0a",
  border: "1px solid #5a3a20",
  borderRadius: "8px",
  padding: "1.25rem",
  cursor: "pointer",
  transition: "border-color 0.2s",
};

const inputStyle: React.CSSProperties = {
  padding: "0.5rem",
  background: "#1a0e0a",
  border: "1px solid #5a3a20",
  borderRadius: "4px",
  color: "#e0d0c0",
  fontSize: "1rem",
  width: "100%",
};

const btnStyle: React.CSSProperties = {
  padding: "0.5rem 1.5rem",
  background: "#c8841a",
  color: "#1a0e0a",
  border: "none",
  borderRadius: "4px",
  cursor: "pointer",
  fontWeight: "bold",
  fontSize: "1rem",
};

export default function SpacesPage() {
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"forum" | "chat" | "project">("forum");

  useEffect(() => {
    fetch(`${API}/api/spaces`).then((r) => r.json()).then(setSpaces).catch(() => {});
  }, []);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API}/api/spaces`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, type }),
    });
    if (res.ok) {
      const space = await res.json();
      setSpaces((prev) => [...prev, space]);
      setName("");
      setDescription("");
      setShowForm(false);
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
        <h1 style={{ color: "#f0c040", margin: 0 }}>🏛 Community Spaces</h1>
        <button style={btnStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Space"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} style={{ ...cardStyle, marginBottom: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input style={inputStyle} placeholder="Space name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input style={inputStyle} placeholder="Description" value={description} onChange={(e) => setDescription(e.target.value)} />
          <select style={inputStyle} value={type} onChange={(e) => setType(e.target.value as typeof type)}>
            <option value="forum">Forum</option>
            <option value="chat">Chat</option>
            <option value="project">Project</option>
          </select>
          <button type="submit" style={btnStyle}>Create Space</button>
        </form>
      )}

      {spaces.length === 0 ? (
        <p style={{ color: "#a89070" }}>No spaces yet. Create the first one!</p>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {spaces.map((s) => (
            <a key={s.id} href={`/spaces/${s.id}`} style={{ textDecoration: "none", color: "inherit" }}>
              <div style={cardStyle}>
                <h3 style={{ color: "#e8a832", margin: "0 0 0.25rem" }}>{s.name}</h3>
                <p style={{ color: "#a89070", margin: "0 0 0.5rem", fontSize: "0.9rem" }}>{s.description}</p>
                <span style={{ fontSize: "0.8rem", color: "#6a5a40", textTransform: "uppercase" }}>{s.type}</span>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
