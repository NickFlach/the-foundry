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

const successStyle: React.CSSProperties = {
  color: "#4ecdc4",
  fontSize: "0.9rem",
  textAlign: "center",
};

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hovering, setHovering] = useState(false);
  
  const { register, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/profile");
    }
  }, [isAuthenticated, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsSubmitting(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords don't match");
      setIsSubmitting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await register(
        formData.email,
        formData.password,
        formData.firstName,
        formData.lastName
      );
      
      if (result.success) {
        setSuccess("Account created successfully! Redirecting...");
        // If auto-login happened (tokens were returned), redirect to profile
        // Otherwise show success message
        setTimeout(() => {
          router.push("/profile");
        }, 2000);
      } else {
        setError(result.error || "Registration failed");
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
        🔥 Join The Foundry
      </h1>

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={{ display: "flex", gap: "1rem" }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="firstName" style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              color: "#e0d0c0" 
            }}>
              First Name
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={isSubmitting}
            />
          </div>

          <div style={{ flex: 1 }}>
            <label htmlFor="lastName" style={{ 
              display: "block", 
              marginBottom: "0.5rem", 
              color: "#e0d0c0" 
            }}>
              Last Name
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              style={inputStyle}
              disabled={isSubmitting}
            />
          </div>
        </div>

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
            name="email"
            value={formData.email}
            onChange={handleChange}
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
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength={6}
            style={inputStyle}
            disabled={isSubmitting}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" style={{ 
            display: "block", 
            marginBottom: "0.5rem", 
            color: "#e0d0c0" 
          }}>
            Confirm Password
          </label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
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

        {success && (
          <div style={successStyle}>
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={hovering ? buttonHoverStyle : buttonStyle}
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
        >
          {isSubmitting ? "Creating Account..." : "Create Account"}
        </button>
      </form>

      <div style={linkStyle}>
        <p style={{ margin: "1rem 0 0.5rem", color: "#a89070" }}>
          Already have an account?
        </p>
        <a href="/login" style={linkStyle}>
          Login Here
        </a>
      </div>
    </div>
  );
}