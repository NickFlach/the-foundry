import { APP_DISPLAY_NAME, TAGLINE } from "@the-foundry/shared";

export default function Home() {
  return (
    <main style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "100vh", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: "3rem" }}>{APP_DISPLAY_NAME}</h1>
      <p style={{ fontSize: "1.25rem", maxWidth: "600px", textAlign: "center", color: "#666" }}>{TAGLINE}</p>
    </main>
  );
}
