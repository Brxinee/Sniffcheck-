import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Smelloff Scheduler",
  description: "Premium unlimited Telegram scheduling for SmelloffIndia.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>{children}</body>
    </html>
  );
}
