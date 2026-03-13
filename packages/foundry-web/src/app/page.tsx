import { APP_DISPLAY_NAME, TAGLINE } from "@the-foundry/shared";

const btnStyle: React.CSSProperties = {
  padding: "0.75rem 2rem",
  background: "#2b1810",
  color: "#e8a832",
  border: "1px solid #c8841a",
  borderRadius: "6px",
  textDecoration: "none",
  fontFamily: "Georgia, serif",
  fontSize: "1.1rem",
};

export default function Home() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "70vh", textAlign: "center" }}>
      <h1 style={{ fontSize: "3rem", color: "#f0c040", marginBottom: "0.5rem" }}>{APP_DISPLAY_NAME}</h1>
      <p style={{ fontSize: "1.25rem", maxWidth: "600px", color: "#a89070" }}>{TAGLINE}</p>
      <div style={{ display: "flex", gap: "1.5rem", marginTop: "2.5rem" }}>
        <a href="/spaces" style={btnStyle}>🏛 Community Spaces</a>
        <a href="/wanted" style={btnStyle}>⚙ Wanted Board</a>
      </div>
    </div>
  );
}
