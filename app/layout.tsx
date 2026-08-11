import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Hacker House Goa 2026",
    template: "%s · Hacker House Goa",
  },
  description:
    "A four-day creative technology gathering by 2:47 PM Studio in Goa, India.",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
