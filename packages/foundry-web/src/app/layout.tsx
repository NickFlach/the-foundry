import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Foundry",
  description: "A community for builders forging the future",
};

const navStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "2rem",
  padding: "1rem 2rem",
  background: "#1a0e0a",
  borderBottom: "2px solid #c8841a",
  fontFamily: "Georgia, serif",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d0907", color: "#e0d0c0", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
        <nav style={navStyle}>
          <a href="/" style={brandStyle}>🔥 The Foundry</a>
          <a href="/spaces" style={linkStyle}>Spaces</a>
          <a href="/wanted" style={linkStyle}>Wanted Board</a>
        </nav>
        <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
          {children}
        </main>
      </body>
    </html>
  );
}
