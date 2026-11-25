"use client";

import { useEffect, useState } from "react";
import { Building2, Plus, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import {
  fetchAllTenantsForSuperAdmin,
  provisionTenantBySuperAdmin,
  TenantDoc,
  updateTenantBySuperAdmin,
} from "@/lib/firestore-service";

interface TenantWithCounts extends TenantDoc {
  studentCount: number;
  teacherCount: number;
  classCount: number;
  attendanceCount: number;
}

interface Summary {
  totalTenants: number;
  activeTenants: number;
  totalStudents: number;
  totalAttendance: number;
}

export default function SuperAdminClient() {
  const [tenants, setTenants] = useState<TenantWithCounts[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [form, setForm] = useState({
    organizationName: "",
    adminName: "",
    adminEmail: "",
    password: "",
    plan: "pro" as "starter" | "pro" | "enterprise",
  });

  async function loadTenants() {
    setLoading(true);
    try {
      const data = await fetchAllTenantsForSuperAdmin();
      setTenants(data.tenants);
      setSummary(data.summary);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTenants();
  }, []);

  async function handleCreateTenant(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    try {
      const created = await provisionTenantBySuperAdmin(form);
      setForm({
        organizationName: "",
        adminName: "",
        adminEmail: "",
        password: "",
        plan: "pro",
      });
      setFeedback(`Workspace "${created.name}" provisioned (${created.slug}).`);
      loadTenants();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Failed to provision workspace.");
    }
  }

  async function updateTenant(
    tenantId: string,
    patch: Partial<Pick<TenantDoc, "plan" | "status">>
  ) {
    setFeedback("");
    await updateTenantBySuperAdmin(tenantId, patch);
    setFeedback("Institution workspace updated.");
    loadTenants();
  }

  if (loading || !summary) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading SaaS platform overview from Firestore...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Super Admin Platform Console</h1>
        <p className="text-sm text-slate-600">
          Manage all institution workspaces, SaaS plans, and tenant statuses in Cloud Firestore.
        </p>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {feedback}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Institutions</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.totalTenants}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="text-xs font-semibold text-emerald-700">Active Workspaces</div>
          <div className="mt-1 text-2xl font-bold text-emerald-900">{summary.activeTenants}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Total Students</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.totalStudents}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Attendance Logs</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.totalAttendance}</div>
        </div>
      </div>

      <form
        onSubmit={handleCreateTenant}
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-3"
      >
        <div className="flex items-center gap-2 font-bold text-slate-900">
          <Building2 className="h-4 w-4 text-emerald-600" />
          Provision New Institution Workspace
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <input
            type="text"
            required
            placeholder="Institution Name"
            value={form.organizationName}
            onChange={(e) => setForm({ ...form, organizationName: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="text"
            required
            placeholder="Admin Full Name"
            value={form.adminName}
            onChange={(e) => setForm({ ...form, adminName: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <input
            type="email"
            required
            placeholder="Admin Email"
            value={form.adminEmail}
            onChange={(e) => setForm({ ...form, adminEmail: e.target.value })}
            className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
          />
          <select
            value={form.plan}
            onChange={(e) =>
              setForm({
                ...form,
                plan: e.target.value as "starter" | "pro" | "enterprise",
              })
            }
            className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
          >
            <option value="starter">Starter</option>
            <option value="pro">Pro</option>
            <option value="enterprise">Enterprise</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
          >
            <Plus className="h-4 w-4" /> Create Workspace
          </button>
        </div>
      </form>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 font-bold text-slate-900">
          Institution Workspaces ({tenants.length})
        </div>
        <div className="divide-y divide-slate-100">
          {tenants.map((t) => (
            <div
              key={t.id}
              className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/70"
            >
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="font-bold text-slate-900">{t.name}</h3>
                  <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-600">
                    {t.slug}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                      t.status === "active"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t.status}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Admin: <strong className="text-slate-700">{t.adminEmail || "—"}</strong> •{" "}
                  {t.studentCount} students • {t.teacherCount} teachers • {t.classCount} classes •{" "}
                  {t.attendanceCount} logs
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={t.plan}
                  onChange={(e) =>
                    updateTenant(t.id, {
                      plan: e.target.value as "starter" | "pro" | "enterprise",
                    })
                  }
                  className="rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-xs font-semibold uppercase text-slate-700"
                >
                  <option value="starter">Starter</option>
                  <option value="pro">Pro</option>
                  <option value="enterprise">Enterprise</option>
                </select>

                <button
                  type="button"
                  onClick={() =>
                    updateTenant(t.id, {
                      status: t.status === "active" ? "suspended" : "active",
                    })
                  }
                  className={`inline-flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold cursor-pointer ${
                    t.status === "active"
                      ? "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                      : "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  }`}
                >
                  <ShieldAlert className="h-3.5 w-3.5" />
                  {t.status === "active" ? "Suspend" : "Activate"}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
