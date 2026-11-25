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
    router.push("/login");
    router.refresh();
  }

  const navItems =
    userRole === "super_admin"
      ? [
          {
            href: "/dashboard/super-admin",
            label: "Platform Workspaces",
            icon: ShieldCheck,
          },
        ]
      : userRole === "student"
      ? [
          {
            href: "/dashboard/student",
            label: "My Attendance & Profile",
            icon: GraduationCap,
          },
        ]
      : userRole === "teacher"
      ? [
          {
            href: "/dashboard/teacher",
            label: "Take Attendance",
            icon: ClipboardCheck,
          },
          {
            href: "/dashboard/teacher/students",
            label: "Student Profiles",
            icon: Users,
          },
        ]
      : [
          {
            href: "/dashboard/admin",
            label: "Institution Overview",
            icon: Shield,
          },
          {
            href: "/dashboard/teacher",
            label: "Take Attendance",
            icon: ClipboardCheck,
          },
          {
            href: "/dashboard/teacher/students",
            label: "Student Profiles",
            icon: Users,
          },
        ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-slate-50">
      {/* Sidebar */}
      <aside className="w-full md:w-64 shrink-0 border-b md:border-b-0 md:border-r border-slate-200 bg-white flex flex-col justify-between">
        <div>
          <div className="p-5 border-b border-slate-100">
            <Link href="/" className="flex items-center gap-2 font-bold text-base text-slate-900">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ClipboardCheck className="h-4 w-4" />
              </span>
              AttendFlow
            </Link>
            <div className="mt-3 rounded-xl bg-slate-50 border border-slate-200 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800 truncate">
                <Building2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
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
                      ? "bg-emerald-50 text-emerald-700 font-semibold"
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

        <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-2">
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
      </aside>

      {/* Main content */}
      <main className="flex-1 min-w-0 p-6 md:p-8">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
