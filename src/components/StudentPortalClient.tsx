"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  BookOpen,
  User,
  Phone,
  MapPin,
  Loader2,
} from "lucide-react";
import {
  AttendanceRecordDoc,
  ClassDoc,
  fetchMyStudentPortal,
  StudentProfileDoc,
} from "@/lib/firestore-service";

interface StudentPortalClientProps {
  tenantId: string;
  uid: string;
}

export default function StudentPortalClient({ tenantId, uid }: StudentPortalClientProps) {
  const [profile, setProfile] = useState<StudentProfileDoc | null>(null);
  const [classInfo, setClassInfo] = useState<ClassDoc | null>(null);
  const [summary, setSummary] = useState<{
    total: number;
    present: number;
    late: number;
    absent: number;
    excused: number;
    attendanceRate: number;
  } | null>(null);
  const [records, setRecords] = useState<AttendanceRecordDoc[]>([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyStudentPortal(tenantId, uid)
      .then((data) => {
        if (data) {
          setProfile(data.profile);
          setClassInfo(data.classInfo);
          setSummary(data.summary);
          setRecords(data.records);
        }
      })
      .finally(() => setLoading(false));
  }, [tenantId, uid]);

  if (loading) {
    return (
      <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading your attendance records...
      </div>
    );
  }

  if (!profile || !summary) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Student profile not found. Please contact your teacher or administrator.
      </div>
    );
  }

  const filteredRecords =
    statusFilter === "all"
      ? records
      : records.filter((r) => r.status === statusFilter);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Assalamu Alaikum, {profile.name}
        </h1>
        <p className="text-sm text-slate-600">
          View your student profile and personal attendance records.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
            Attendance Rate
          </div>
          <div className="mt-1 text-3xl font-extrabold text-emerald-900">
            {summary.attendanceRate}%
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-emerald-200 overflow-hidden">
            <div
              className="h-full bg-emerald-600 rounded-full"
              style={{ width: `${summary.attendanceRate}%` }}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
            <CheckCircle2 className="h-4 w-4" /> Present
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.present}</div>
          <div className="text-xs text-slate-500">out of {summary.total} days</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-600">
            <Clock className="h-4 w-4" /> Late
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.late}</div>
          <div className="text-xs text-slate-500">days arrived late</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-red-600">
            <XCircle className="h-4 w-4" /> Absent
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.absent}</div>
          <div className="text-xs text-slate-500">unexcused absences</div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-sky-600">
            <FileCheck2 className="h-4 w-4" /> Excused
          </div>
          <div className="mt-1 text-2xl font-bold text-slate-900">{summary.excused}</div>
          <div className="text-xs text-slate-500">approved leaves</div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
              <User className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Student Profile</h2>
              <p className="text-xs text-slate-500">Roll No: {profile.rollNumber}</p>
            </div>
          </div>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
            Active Student
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 text-sm">
          <div>
            <div className="text-xs text-slate-500">Class / Batch</div>
            <div className="font-medium text-slate-900 flex items-center gap-1.5 mt-0.5">
              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
              {classInfo?.name || "Unassigned"}
            </div>
            {classInfo?.schedule && (
              <div className="text-xs text-slate-500 mt-0.5">{classInfo.schedule}</div>
            )}
          </div>

          <div>
            <div className="text-xs text-slate-500">Assigned Teacher</div>
            <div className="font-medium text-slate-900 mt-0.5">
              {classInfo?.teacherName || "—"}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Guardian</div>
            <div className="font-medium text-slate-900 mt-0.5">
              {profile.guardianName || "—"}
            </div>
            {profile.guardianPhone && (
              <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Phone className="h-3 w-3" /> {profile.guardianPhone}
              </div>
            )}
          </div>

          <div>
            <div className="text-xs text-slate-500">Email</div>
            <div className="font-medium text-slate-900 mt-0.5">{profile.email}</div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Date of Birth</div>
            <div className="font-medium text-slate-900 mt-0.5">
              {profile.dateOfBirth || "—"}
            </div>
          </div>

          <div>
            <div className="text-xs text-slate-500">Address</div>
            <div className="font-medium text-slate-900 flex items-center gap-1 mt-0.5">
              <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              <span className="truncate">{profile.address || "—"}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <h2 className="text-base font-bold text-slate-900">Attendance Records</h2>
          <div className="flex flex-wrap gap-1.5">
            {["all", "present", "late", "absent", "excused"].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition cursor-pointer ${
                  statusFilter === status
                    ? "bg-emerald-600 text-white"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        {filteredRecords.length === 0 ? (
          <div className="p-10 text-center text-sm text-slate-500">
            No attendance records found for this filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase text-slate-500 border-b border-slate-200">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Class</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Recorded By</th>
                  <th className="px-5 py-3">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3 font-mono text-xs font-semibold text-slate-800">
                      {rec.date}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">{rec.className}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize ${
                          rec.status === "present"
                            ? "bg-emerald-100 text-emerald-800"
                            : rec.status === "late"
                            ? "bg-amber-100 text-amber-800"
                            : rec.status === "excused"
                            ? "bg-sky-100 text-sky-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {rec.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {rec.markedByName || "Teacher"}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {rec.remarks || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
