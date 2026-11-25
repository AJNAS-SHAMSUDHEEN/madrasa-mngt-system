import type { Metadata } from "next";
import "./globals.css";
import FirebaseAnalytics from "@/components/FirebaseAnalytics";

export const metadata: Metadata = {
  title: "AttendFlow SaaS — Multi-Tenant Attendance & Student Profile Platform",
  description:
    "Modern SaaS attendance tracking for schools, academies, and madrasas. Teachers record attendance & manage student profiles; students track their records in real time.",
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
