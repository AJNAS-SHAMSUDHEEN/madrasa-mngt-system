"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { onAuthStateChanged } from "firebase/auth";
import { ClipboardCheck, Menu, X } from "lucide-react";
import InstallAppButton from "@/components/InstallAppButton";
import { firebaseAuth } from "@/lib/firebase";
import { getRoleDashboardPath, loadSessionForUid } from "@/lib/firestore-service";

const NAV_LINKS = [
  { href: "#why", label: "Why It Helps" },
  { href: "#how", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
];

export default function PublicNavbar() {
  const [open, setOpen] = useState(false);
  const [dashboardHref, setDashboardHref] = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setDashboardHref(null);
        return;
      }
      const session = await loadSessionForUid(user.uid);
      if (session) {
        setDashboardHref(getRoleDashboardPath(session.user.role));
      }
    });
    return () => unsub();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3.5 gap-4">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-bold text-base sm:text-lg text-slate-900 tracking-tight"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm shrink-0">
            <ClipboardCheck className="h-5 w-5" />
          </span>
          <span>Madrasa Management</span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-emerald-700 transition-colors"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden sm:flex items-center gap-2">
          <InstallAppButton variant="compact" label="Install App" />
          <Link
            href={dashboardHref || "/login"}
            className="rounded-xl px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
          >
            {dashboardHref ? "Open App" : "Sign In"}
          </Link>
          <a
            href="#contact"
            className="inline-flex items-center rounded-xl bg-emerald-700 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 transition"
          >
            Request Demo
          </a>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
          className="md:hidden rounded-xl p-2 text-slate-600 hover:bg-slate-100 cursor-pointer"
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
          <div className="grid grid-cols-2 gap-2 text-sm font-medium text-slate-700">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-lg px-3 py-2 hover:bg-slate-50"
              >
                {link.label}
              </a>
            ))}
          </div>
          <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-100">
            <InstallAppButton variant="compact" label="Install App" className="w-full" />
            <Link
              href={dashboardHref || "/login"}
              className="flex-1 text-center rounded-xl border border-slate-300 py-2 text-sm font-semibold text-slate-700"
            >
              {dashboardHref ? "Open App" : "Sign In"}
            </Link>
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="flex-1 text-center rounded-xl bg-emerald-700 py-2 text-sm font-semibold text-white"
            >
              Request Demo
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
