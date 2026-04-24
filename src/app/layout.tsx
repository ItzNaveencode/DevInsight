import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DevInsight Pro — Engineering Intelligence Platform",
  description: "Transform raw SDLC data into actionable engineering insights. Identify bottlenecks, track trends, and accelerate developer workflows.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
