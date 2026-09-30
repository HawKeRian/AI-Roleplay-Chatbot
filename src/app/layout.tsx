import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Fable Local — Roleplay Studio",
  description: "A private, local-first AI roleplay studio powered by Ollama.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
