import type { Metadata } from "next";
import { Providers } from "./providers";
import { NavBar } from "./nav-bar";

export const metadata: Metadata = {
  title: "The Foundry",
  description: "A community for builders forging the future",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#0d0907", color: "#e0d0c0", fontFamily: "system-ui, sans-serif", minHeight: "100vh" }}>
        <Providers>
          <NavBar />
          <main style={{ padding: "2rem", maxWidth: "960px", margin: "0 auto" }}>
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
