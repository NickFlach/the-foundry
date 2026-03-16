"use client";

import { useEffect } from "react";
import { useAuth } from "../auth-context";
import { useRouter } from "next/navigation";

const containerStyle: React.CSSProperties = {
  maxWidth: "600px",
  margin: "2rem auto",
  padding: "2rem",
  background: "#1a0e0a",
  border: "1px solid #c8841a",
  borderRadius: "8px",
};

const cardStyle: React.CSSProperties = {
  background: "#2b1810",
  border: "1px solid #3a2a1a",
  borderRadius: "6px",
  padding: "1.5rem",
  marginBottom: "1.5rem",
};

const labelStyle: React.CSSProperties = {
  color: "#a89070",
  fontSize: "0.9rem",
  marginBottom: "0.5rem",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
};

const valueStyle: React.CSSProperties = {
  color: "#e0d0c0",
  fontSize: "1.1rem",
  marginBottom: "1rem",
};

const buttonStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  fontSize: "1rem",
  background: "#2b1810",
  color: "#e8a832",
  border: "1px solid #c8841a",
  borderRadius: "4px",
  cursor: "pointer",
  fontFamily: "Georgia, serif",
  marginTop: "1rem",
};

const buttonHoverStyle: React.CSSProperties = {
  ...buttonStyle,
  background: "#c8841a",
  color: "#1a0e0a",
};

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "Unknown";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return "Unknown";
    }
  };

  if (isLoading) {
    return (
      <div style={containerStyle}>
        <p style={{ textAlign: "center", color: "#a89070" }}>Loading...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null; // Will redirect to login
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
        🔥 Your Foundry Profile
      </h1>

      <div style={cardStyle}>
        <div style={labelStyle}>Full Name</div>
        <div style={valueStyle}>
          {user.firstName} {user.lastName}
        </div>

        <div style={labelStyle}>Email</div>
        <div style={valueStyle}>
          {user.email}
        </div>

        <div style={labelStyle}>Role</div>
        <div style={valueStyle}>
          {user.role || "Member"}
        </div>

        <div style={labelStyle}>Member Since</div>
        <div style={valueStyle}>
          {formatDate(user.createdAt)}
        </div>
      </div>

      <div style={cardStyle}>
        <h3 style={{ 
          color: "#f0c040", 
          fontFamily: "Georgia, serif",
          marginTop: 0,
          marginBottom: "1rem"
        }}>
          Account Settings
        </h3>
        
        <p style={{ color: "#a89070", marginBottom: "1rem" }}>
          More profile customization options coming soon! For now, you can manage your basic account settings.
        </p>

        <button
          onClick={handleLogout}
          style={buttonStyle}
          onMouseEnter={(e) => Object.assign(e.currentTarget.style, buttonHoverStyle)}
          onMouseLeave={(e) => Object.assign(e.currentTarget.style, buttonStyle)}
        >
          Logout
        </button>
      </div>

      <div style={cardStyle}>
        <h3 style={{ 
          color: "#f0c040", 
          fontFamily: "Georgia, serif",
          marginTop: 0,
          marginBottom: "1rem"
        }}>
          Coming Soon
        </h3>
        
        <ul style={{ 
          color: "#a89070", 
          lineHeight: "1.6",
          paddingLeft: "1.5rem"
        }}>
          <li>Reputation system and achievements</li>
          <li>Post history and contributions</li>
          <li>Project showcase</li>
          <li>Community activity feed</li>
          <li>Skills and expertise tags</li>
        </ul>
      </div>
    </div>
  );
}