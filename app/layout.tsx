import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kat's Lesson Plan Generator | La Consolacion College - Pasig",
  description: "Automated official lesson plan generator for Kinder 2 and Grade 1 at La Consolacion College - Pasig",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col font-sans selection:bg-sage-100 selection:text-sage-700">
        {children}
      </body>
    </html>
  );
}
