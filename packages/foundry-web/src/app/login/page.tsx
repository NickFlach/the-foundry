"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

const containerStyle: React.CSSProperties = {
  maxWidth: "400px",
  margin: "2rem auto",
  padding: "2rem",
  background: "#1a0e0a",
  border: "1px solid #c8841a",
  borderRadius: "8px",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const inputStyle: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "1rem",
  border: "1px solid #3a2a1a",
  borderRadius: "4px",
  background: "#2b1810",
  color: "#e0d0c0",
  width: "100%",
  boxSizing: "border-box",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem",
  fontSize: "1rem",
  background: "#2b1810",
  color: "#e8a832",
  border: "1px solid #c8841a",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "Georgia, serif",
};

const buttonHoverStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#c8841a",
  color: "#1a0e0a",
};

const linkStyle: React.CSSProperties = {
  color: "#e8a832",
  textDecoration: "none",
  textAlign: "center",
  marginTop: "1rem",
};

const errorStyle: React.CSSProperties = {
  color: "#ff6b6b",
  fontSize: "0.9rem",
  textAlign: "center",
};

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hovering, setHovering] = useState(false);
  
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        router.push("/profile");
      } else {
        setError(result.error || "Login failed");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <p style={{ textAlign: "center", color: "#a89070" }}>Loading...</p>
      </div>
    );
  }

  if (isAuthenticated) {
    return null; // Will redirect to profile
  }

  return (
    <div style={containerStyle}>
      <h1 style={{ 
        textAlign: "center", 
        color: "#f0c040", 
        fontFamily: "Georgia, serif",
        marginBottom: "2rem",
        marginTop: 0
      }}>
        🔥 Login to The Foundry
      </h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div>
          <label htmlFor="email" style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            color: "#e0d0c0" 
          }}>
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={inputStyle}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="password" style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            color: "#e0d0c0" 
          }}>
            Password
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={inputStyle}
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div style={errorStyle}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={hovering ? buttonHoverStyle : buttonStyle}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {isSubmitting ? "Logging in..." : "Login"}
        </button>
      </form>

      <div style={linkStyle}>
        <p style={{ margin: "1rem 0 0.5rem", color: "#a89070" }}>
          Don't have an account?
        </p>
        <a href="/register" style={linkStyle}>
          Create an Account
        </a>
      </div>

      <div style={{ 
        textAlign: "center", 
        marginTop: "1.5rem", 
        paddingTop: "1rem", 
        borderTop: "1px solid #3a2a1a",
        fontSize: "0.75rem",
        color: "#5a4a3a"
      }}>
        🔐 Powered by <span style={{ color: "#a89070" }}>SpaceChild Auth</span> with <span style={{ color: "#a89070" }}>Zero-Knowledge Proofs</span>
      </div>
    </div>
  );
}