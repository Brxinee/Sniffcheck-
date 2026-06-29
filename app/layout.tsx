import "./globals.css";
import type { Metadata } from "next";
export const metadata: Metadata = { title: "Smelloff Scheduler", description: "Premium unlimited Telegram scheduling for Smelloff." };
export default function RootLayout({ children }: { children: React.ReactNode }) { return <html lang="en" className="dark"><body>{children}</body></html>; }
