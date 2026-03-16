"use client";

import { useAuth } from "./auth-context";

const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
  padding: "1rem 2rem",
  background: "#1a0e0a",
  borderBottom: "2px solid #c8841a",
  fontFamily: "Georgia, serif",
};

const leftSideStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
  flex: 1,
};

const rightSideStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

const linkStyle: React.CSSProperties = {
  color: "#e8a832",
  textDecoration: "none",
  fontSize: "1rem",
};

const brandStyle: React.CSSProperties = {
  color: "#f0c040",
  fontSize: "1.4rem",
  fontWeight: "bold",
  textDecoration: "none",
};

const userNameStyle: React.CSSProperties = {
  color: "#e0d0c0",
  fontSize: "0.9rem",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.5rem 1rem",
  background: "#2b1810",
  color: "#e8a832",
  border: "1px solid #c8841a",
  borderRadius: "4px",
  textDecoration: "none",
  fontSize: "0.9rem",
  cursor: "pointer",
  fontFamily: "inherit",
};

export function NavBar() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();

  return (
    <nav style={navStyle}>
      <div style={leftSideStyle}>
        <a href="/" style={brandStyle}>🔥 The Foundry</a>
        <a href="/spaces" style={linkStyle}>Spaces</a>
        <a href="/wanted" style={linkStyle}>Wanted Board</a>
      </div>

      <div style={rightSideStyle}>
        {isLoading ? (
          <span style={{ color: "#a89070", fontSize: "0.9rem" }}>...</span>
        ) : isAuthenticated && user ? (
          <>
            <span style={userNameStyle}>
              Welcome, {user.firstName}
            </span>
            <a href="/profile" style={linkStyle}>
              Profile
            </a>
            <button
              onClick={logout}
              style={buttonStyle}
            >
              Logout
            </button>
          </>
        ) : (
          <>
            <a href="/login" style={buttonStyle}>
              Login
            </a>
            <a href="/register" style={buttonStyle}>
              Register
            </a>
          </>
        )}
      </div>
    </nav>
  );
}