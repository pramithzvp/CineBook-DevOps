import type { Metadata } from "next";
import { Film } from "lucide-react";
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
      <body className="antialiased">
        <a className="text-button px-[5.5%] pt-2" href="/movie-catalogue">
          <Film size={16} /> Movie API catalogue
        </a>
        {children}
      </body>
    </html>
  );
}
