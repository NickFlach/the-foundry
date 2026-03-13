import { APP_DISPLAY_NAME, TAGLINE } from "@the-foundry/shared";

export default function Home() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "3rem" }}>{APP_DISPLAY_NAME}</h1>
      <p style={{ fontSize: "1.25rem", maxWidth: "600px", textAlign: "center", color: "#666" }}>{TAGLINE}</p>
      <a href="/wanted" style={{ marginTop: "2rem", padding: "0.75rem 2rem", background: "#2b1810", color: "#c8a04a", border: "1px solid #8b6914", borderRadius: "6px", textDecoration: "none", fontFamily: "Georgia, serif", fontSize: "1.1rem" }}>
        ⚙ Wanted Board
      </a>
    </main>
  );
}
