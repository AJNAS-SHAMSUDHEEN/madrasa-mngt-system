"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  ClipboardCheck,
  Users,
  GraduationCap,
  Shield,
  ShieldCheck,
  LogOut,
  Building2,
} from "lucide-react";
import { signOutFirebase, type UserRole } from "@/lib/firestore-service";
import InstallAppButton from "@/components/InstallAppButton";

interface DashboardShellProps {
  userName: string;
  userRole: UserRole;
  tenantName: string;
  plan: string;
  children: React.ReactNode;
}

const ROLE_LABELS: Record<UserRole, string> = {
  super_admin: "Super Admin",
  institution_admin: "Institution Admin",
  teacher: "Teacher",
  student: "Student",
};

export default function DashboardShell({
  userName,
  userRole,
  tenantName,
  plan,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();

  async function handleLogout() {
    await signOutFirebase();
    router.replace("/login");
    router.refresh();
  }

  const navItems =
    userRole === "super_admin"
      ? [
          {
            href: "/dashboard/super-admin",
            label: "Workspaces",
            icon: ShieldCheck,
          },
        ]
      : userRole === "student"
      ? [
          {
            href: "/dashboard/student",
            label: "My Attendance",
            icon: GraduationCap,
          },
        ]
      : userRole === "teacher"
      ? [
          {
            href: "/dashboard/teacher",
            label: "Attendance",
            icon: ClipboardCheck,
          },
          {
            href: "/dashboard/teacher/students",
            label: "Students",
            icon: Users,
          },
        ]
      : [
          {
            href: "/dashboard/admin",
            label: "Overview",
            icon: Shield,
          },
          {
            href: "/dashboard/teacher",
            label: "Attendance",
            icon: ClipboardCheck,
          },
          {
            href: "/dashboard/teacher/students",
            label: "Students",
            icon: Users,
          },
        ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 border-r border-slate-200 bg-white flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2 font-bold text-base text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white">
                <ClipboardCheck className="h-4 w-4" />
              </span>
              Madrasa Mngt
            </Link>
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
                <Building2 className="h-3.5 w-3.5 text-emerald-700 shrink-0" />
                <span className="truncate">{tenantName}</span>
              </div>
              <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500">
                <span>{ROLE_LABELS[userRole]}</span>
                <span className="rounded bg-emerald-100 px-1.5 py-0.5 font-semibold uppercase text-emerald-800">
                  {plan}
                </span>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    active
                      ? "bg-emerald-50 text-emerald-800 font-semibold"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-100 space-y-3">
          <InstallAppButton variant="compact" label="Install App" className="w-full" />
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{userName}</p>
              <p className="text-xs text-slate-500">{ROLE_LABELS[userRole]}</p>
            </div>
            <button
              onClick={handleLogout}
              title="Sign out"
              className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Top App Bar */}
      <header className="md:hidden sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-700 text-white shrink-0">
            <ClipboardCheck className="h-4 w-4" />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-slate-900 truncate">{tenantName}</p>
            <p className="text-[11px] text-slate-500 truncate">
              {userName} • {ROLE_LABELS[userRole]}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <InstallAppButton variant="compact" label="Install" />
          <button
            onClick={handleLogout}
            title="Sign out"
            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600 transition cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur flex items-center justify-around px-2 py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 rounded-xl px-4 py-1.5 text-[11px] font-semibold transition ${
                active ? "text-emerald-700 bg-emerald-50" : "text-slate-500"
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
