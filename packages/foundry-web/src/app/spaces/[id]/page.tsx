"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import type { Space, Post } from "@the-foundry/shared";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const cardStyle: React.CSSProperties = {
  background: "#1a0e0a",
  border: "1px solid #5a3a20",
  borderRadius: "8px",
  padding: "1.25rem",
  marginBottom: "1rem",
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

interface SpaceWithPosts extends Space {
  posts: Post[];
}

export default function SpacePage() {
  const params = useParams();
  const id = params.id as string;
  const [space, setSpace] = useState<SpaceWithPosts | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [replyContent, setReplyContent] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch(`${API}/api/spaces/${id}`).then((r) => r.json()).then(setSpace).catch(() => {});
  }, [id]);

  async function handleCreatePost(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch(`${API}/api/spaces/${id}/posts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content, authorId: "web-user", authorType: "human" }),
    });
    if (res.ok) {
      const post = await res.json();
      setSpace((prev) => prev ? { ...prev, posts: [post, ...prev.posts] } : prev);
      setTitle("");
      setContent("");
      setShowForm(false);
    }
  }

  async function handleReply(postId: string) {
    const text = replyContent[postId];
    if (!text) return;
    const res = await fetch(`${API}/api/posts/${postId}/replies`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: text, authorId: "web-user", authorType: "human" }),
    });
    if (res.ok) {
      const reply = await res.json();
      setSpace((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          posts: prev.posts.map((p) =>
            p.id === postId ? { ...p, replies: [...p.replies, reply] } : p
          ),
        };
      });
      setReplyContent((prev) => ({ ...prev, [postId]: "" }));
    }
  }

  if (!space) return <p style={{ color: "#a89070" }}>Loading...</p>;

  return (
    <div>
      <a href="/spaces" style={{ color: "#c8841a", textDecoration: "none", fontSize: "0.9rem" }}>← Back to Spaces</a>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", margin: "1rem 0" }}>
        <div>
          <h1 style={{ color: "#f0c040", margin: 0 }}>{space.name}</h1>
          <p style={{ color: "#a89070", margin: "0.25rem 0" }}>{space.description}</p>
          <span style={{ fontSize: "0.8rem", color: "#6a5a40", textTransform: "uppercase" }}>{space.type}</span>
        </div>
        <button style={btnStyle} onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "+ New Post"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreatePost} style={{ ...cardStyle, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <input style={inputStyle} placeholder="Post title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <textarea style={{ ...inputStyle, minHeight: "80px", resize: "vertical" }} placeholder="What's on your mind?" value={content} onChange={(e) => setContent(e.target.value)} required />
          <button type="submit" style={btnStyle}>Post</button>
        </form>
      )}

      {space.posts.length === 0 ? (
        <p style={{ color: "#a89070", marginTop: "2rem" }}>No posts yet. Start the conversation!</p>
      ) : (
        space.posts.map((post) => (
          <div key={post.id} style={cardStyle}>
            <h3 style={{ color: "#e8a832", margin: "0 0 0.25rem" }}>{post.title}</h3>
            <p style={{ color: "#c0b0a0", margin: "0 0 0.5rem" }}>{post.content}</p>
            <span style={{ fontSize: "0.75rem", color: "#6a5a40" }}>
              by {post.authorId} ({post.authorType}) · {new Date(post.createdAt).toLocaleDateString()}
            </span>

            {post.replies.length > 0 && (
              <div style={{ marginTop: "0.75rem", paddingLeft: "1rem", borderLeft: "2px solid #3a2a1a" }}>
                {post.replies.map((r) => (
                  <div key={r.id} style={{ marginBottom: "0.5rem" }}>
                    <p style={{ color: "#b0a090", margin: 0, fontSize: "0.9rem" }}>{r.content}</p>
                    <span style={{ fontSize: "0.7rem", color: "#6a5a40" }}>— {r.authorId}</span>
                  </div>
                ))}
              </div>
            )}

            <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.75rem" }}>
              <input
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Reply..."
                value={replyContent[post.id] || ""}
                onChange={(e) => setReplyContent((prev) => ({ ...prev, [post.id]: e.target.value }))}
              />
              <button style={{ ...btnStyle, padding: "0.5rem 1rem" }} onClick={() => handleReply(post.id)}>Reply</button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
