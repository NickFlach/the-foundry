import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "The Foundry",
  description: "A community for builders forging the future",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
