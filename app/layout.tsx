import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CineBook — Your next movie night",
  description: "Explore films, choose your showtime and reserve your favourite cinema seats.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
