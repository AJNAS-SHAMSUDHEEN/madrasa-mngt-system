import type { Metadata, Viewport } from "next";
import "./globals.css";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";

export const viewport: Viewport = {
  themeColor: "#047857",
};

export const metadata: Metadata = {
  title: "Madrasa Management System — Multi-Institution SaaS Platform",
  description:
    "Dedicated multi-institution SaaS platform for Madrasa administration. Simplify daily attendance, student profiles, class organization, and role-based institutional coordination.",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Madrasa Mngt",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans">
        <FirebaseAnalytics />
        {children}
      </body>
    </html>
  );
}
