import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kathrynn's Personal Lesson Plan Maker | La Consolacion College - Pasig",
  description: "Automated lesson plan generator for Kinder 2 and Grade 1 at La Consolacion College - Pasig",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <script src="https://js.puter.com/v2/" async></script>
      </head>
      <body className="min-h-screen flex flex-col font-sans selection:bg-sage-100 selection:text-sage-700">
        {children}
      </body>
    </html>
  );
}
