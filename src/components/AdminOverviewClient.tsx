"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Users,
  BookOpen,
  UserPlus,
  Plus,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import {
  AppUser,
  ClassDoc,
  createClass,
  createTeacherAccount,
  fetchInstitutionOverview,
  TenantDoc,
  updateTenantPlan,
} from "@/lib/firestore-service";

interface AdminOverviewClientProps {
  tenantId: string;
}

export default function AdminOverviewClient({ tenantId }: AdminOverviewClientProps) {
  const [tenant, setTenant] = useState<TenantDoc | null>(null);
  const [teachers, setTeachers] = useState<Array<AppUser & { classCount: number }>>([]);
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalRecords: 0,
    attendedRecords: 0,
  });
  const [loading, setLoading] = useState(true);

  const [teacherForm, setTeacherForm] = useState({ name: "", email: "", password: "" });
  const [classForm, setClassForm] = useState({ name: "", schedule: "", teacherId: "" });
  const [feedback, setFeedback] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchInstitutionOverview(tenantId);
      setTenant(data.tenant);
      setTeachers(data.teachers);
      setClasses(data.classes);
      setStats(data.stats);
      if (data.teachers.length > 0 && !classForm.teacherId) {
        setClassForm((prev) => ({ ...prev, teacherId: data.teachers[0].uid }));
      }
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tenantId]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  async function handleAddTeacher(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    try {
      const created = await createTeacherAccount(tenantId, teacherForm);
      setTeacherForm({ name: "", email: "", password: "" });
      setFeedback(`Teacher "${created.name}" created in Firebase Auth & Firestore.`);
      loadAll();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : "Could not create teacher.");
    }
  }

  async function handleAddClass(e: React.FormEvent) {
    e.preventDefault();
    setFeedback("");
    const teacher = teachers.find((t) => t.uid === classForm.teacherId);
    const created = await createClass(tenantId, {
      name: classForm.name,
      schedule: classForm.schedule,
      teacherId: classForm.teacherId,
      teacherName: teacher?.name || "Unassigned",
    });
    setClassForm({ name: "", schedule: "", teacherId: classForm.teacherId });
    setFeedback(`Class "${created.name}" created.`);
    loadAll();
  }

  async function handlePlanChange(plan: "starter" | "pro" | "enterprise") {
    await updateTenantPlan(tenantId, plan);
    setFeedback(`Workspace plan updated to ${plan.toUpperCase()}.`);
    loadAll();
  }

  if (loading || !tenant) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading workspace overview...
      </div>
    );
  }

  const overallRate =
    stats.totalRecords > 0
      ? Math.round((stats.attendedRecords / stats.totalRecords) * 100)
      : 100;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{tenant.name}</h1>
          <p className="text-sm text-slate-600">
            Workspace slug: <span className="font-mono">{tenant.slug}</span> • Institution Admin
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Plan:</span>
          {(["starter", "pro", "enterprise"] as const).map((plan) => (
            <button
              key={plan}
              onClick={() => handlePlanChange(plan)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold uppercase transition cursor-pointer ${
                tenant.plan === plan
                  ? "bg-emerald-600 text-white"
                  : "border border-slate-300 bg-white text-slate-600 hover:bg-slate-50"
              }`}
            >
              {plan}
            </button>
          ))}
        </div>
      </div>

      {feedback && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          {feedback}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Active Students</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalStudents}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Teachers</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalTeachers}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="text-xs font-semibold text-slate-500">Classes</div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{stats.totalClasses}</div>
        </div>
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4">
          <div className="text-xs font-semibold text-emerald-700">Overall Attendance</div>
          <div className="mt-1 text-2xl font-bold text-emerald-900">{overallRate}%</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Users className="h-4 w-4 text-emerald-600" />
            Teachers ({teachers.length})
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
            {teachers.map((t) => (
              <div key={t.uid} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                <div>
                  <div className="font-semibold text-slate-900">{t.name}</div>
                  <div className="text-xs text-slate-500">{t.email}</div>
                </div>
                <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                  {t.classCount} classes
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddTeacher} className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Invite / Add Teacher
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Teacher Name"
                value={teacherForm.name}
                onChange={(e) => setTeacherForm({ ...teacherForm, name: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="email"
                required
                placeholder="Email"
                value={teacherForm.email}
                onChange={(e) => setTeacherForm({ ...teacherForm, email: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Temp Password (default: teacher123)"
                value={teacherForm.password}
                onChange={(e) => setTeacherForm({ ...teacherForm, password: e.target.value })}
                className="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
              >
                <UserPlus className="h-4 w-4" /> Add
              </button>
            </div>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <BookOpen className="h-4 w-4 text-emerald-600" />
            Classes & Batches ({classes.length})
          </div>

          <div className="divide-y divide-slate-100 border border-slate-100 rounded-xl">
            {classes.map((c) => (
              <div key={c.id} className="flex items-center justify-between px-3.5 py-2.5 text-sm">
                <div>
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">
                    {c.schedule || "No schedule"} • {c.teacherName || "Unassigned"}
                  </div>
                </div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {c.studentCount || 0} students
                </span>
              </div>
            ))}
          </div>

          <form onSubmit={handleAddClass} className="pt-2 border-t border-slate-100 space-y-2.5">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Create New Class
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <input
                type="text"
                required
                placeholder="Class Name (e.g. Quran Nazira)"
                value={classForm.name}
                onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
              <input
                type="text"
                placeholder="Schedule (e.g. Mon-Fri 4 PM)"
                value={classForm.schedule}
                onChange={(e) => setClassForm({ ...classForm, schedule: e.target.value })}
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex gap-2">
              <select
                value={classForm.teacherId}
                onChange={(e) => setClassForm({ ...classForm, teacherId: e.target.value })}
                className="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="">Assign Teacher (Optional)</option>
                {teachers.map((t) => (
                  <option key={t.uid} value={t.uid}>
                    {t.name}
                  </option>
                ))}
              </select>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 cursor-pointer"
              >
                <Plus className="h-4 w-4" /> Create
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm flex items-center gap-3 text-xs text-slate-600">
        <Building2 className="h-5 w-5 text-emerald-600 shrink-0" />
        <span>
          All data in this workspace is isolated to <strong>{tenant.name}</strong> in Cloud
          Firestore with role-based security rules.
        </span>
      </div>
    </div>
  );
}
