"use client";

import { APP_DISPLAY_NAME, TAGLINE } from "@the-foundry/shared";
import { useAuth } from "./auth-context";

const btnStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  background: "#2b1810",
  color: "#e8a832",
  border: "1px solid #c8841a",
  borderRadius: "6px",
  textDecoration: "none",
  fontFamily: "Georgia, serif",
  fontSize: "1.1rem",
  display: "inline-block",
};

const primaryBtnStyle: React.CSSProperties = {
  ...btnStyle,
  background: "#c8841a",
  color: "#1a0e0a",
  fontWeight: "bold",
};

const welcomeStyle: React.CSSProperties = {
  fontSize: "1.5rem",
  color: "#f0c040",
  marginBottom: "1rem",
  fontFamily: "Georgia, serif",
};

export default function Home() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <h1 style={{ fontSize: "3rem", color: "#f0c040", marginBottom: "0.5rem", fontFamily: "Georgia, serif" }}>
        {APP_DISPLAY_NAME}
      </h1>
      
      <p style={{ fontSize: "1.25rem", maxWidth: "600px", color: "#a89070", marginBottom: "2rem" }}>
        {TAGLINE}
      </p>

      {!isLoading && isAuthenticated && user && (
        <div style={welcomeStyle}>
          Welcome back, {user.firstName}! 🎯
        </div>
      )}

      <div style={{ display: "flex", gap: "1.5rem", marginTop: "1.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        <a href="/spaces" style={btnStyle}>🏛 Community Spaces</a>
        <a href="/wanted" style={btnStyle}>⚙ Wanted Board</a>
        
        {!isLoading && isAuthenticated && (
          <a href="/profile" style={btnStyle}>👤 Your Profile</a>
        )}
      </div>

      {!isLoading && !isAuthenticated && (
        <div style={{ marginTop: "3rem" }}>
          <p style={{ fontSize: "1.1rem", color: "#e0d0c0", marginBottom: "1.5rem" }}>
            Join our community of builders and creators
          </p>
          
          <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
            <a href="/register" style={primaryBtnStyle}>🚀 Join The Foundry</a>
            <a href="/login" style={btnStyle}>🔓 Login</a>
          </div>
        </div>
      )}
    </div>
  );
}
