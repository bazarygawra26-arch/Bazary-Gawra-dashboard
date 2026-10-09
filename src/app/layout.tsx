import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bazary Gawra (بازاڕی گەورە) — Admin & Operations Dashboard",
  description: "Operations management, merchant verification and listing transparency moderation for Bazary Gawra - Kurdistan's AI-powered local marketplace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ku" dir="rtl" className="h-full">
      <body className="min-h-full flex flex-col bg-[#FAF9F6] text-[#171717] antialiased">
        {children}
      </body>
    </html>
  );
}
