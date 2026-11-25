"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Calendar,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck2,
  Save,
  Loader2,
  Users,
} from "lucide-react";
import {
  AttendanceStatus,
  ClassDoc,
  fetchAttendanceRoster,
  fetchClasses,
  saveAttendanceRoster,
} from "@/lib/firestore-service";

interface RosterStudent {
  studentId: string;
  rollNumber: string;
  name: string;
  email: string;
  attendanceStatus: AttendanceStatus | null;
  remarks: string;
}

const STATUS_OPTIONS: Array<{
  value: AttendanceStatus;
  label: string;
  activeClass: string;
  icon: typeof CheckCircle2;
}> = [
  {
    value: "present",
    label: "Present",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
    icon: CheckCircle2,
  },
  {
    value: "late",
    label: "Late",
    activeClass: "bg-amber-500 text-white border-amber-500",
    icon: Clock,
  },
  {
    value: "absent",
    label: "Absent",
    activeClass: "bg-red-600 text-white border-red-600",
    icon: XCircle,
  },
  {
    value: "excused",
    label: "Excused",
    activeClass: "bg-sky-600 text-white border-sky-600",
    icon: FileCheck2,
  },
];

interface TeacherAttendanceClientProps {
  tenantId: string;
  userId: string;
  userName: string;
}

export default function TeacherAttendanceClient({
  tenantId,
  userId,
  userName,
}: TeacherAttendanceClientProps) {
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [selectedClassId, setSelectedClassId] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [roster, setRoster] = useState<RosterStudent[]>([]);
  const [statuses, setStatuses] = useState<Record<string, AttendanceStatus>>({});
  const [remarks, setRemarks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetchClasses(tenantId).then((list) => {
      setClasses(list);
      if (list.length > 0) {
        setSelectedClassId(list[0].id);
      } else {
        setLoading(false);
      }
    });
  }, [tenantId]);

  const loadRoster = useCallback(
    async (classId: string, targetDate: string) => {
      if (!classId) return;
      setLoading(true);
      setMessage("");
      try {
        const rows = await fetchAttendanceRoster(tenantId, classId, targetDate);
        setRoster(rows);

        const nextStatuses: Record<string, AttendanceStatus> = {};
        const nextRemarks: Record<string, string> = {};
        for (const row of rows) {
          nextStatuses[row.studentId] = row.attendanceStatus || "present";
          nextRemarks[row.studentId] = row.remarks || "";
        }
        setStatuses(nextStatuses);
        setRemarks(nextRemarks);
      } finally {
        setLoading(false);
      }
    },
    [tenantId]
  );

  useEffect(() => {
    if (selectedClassId) {
      loadRoster(selectedClassId, date);
    }
  }, [selectedClassId, date, loadRoster]);

  function markAll(status: AttendanceStatus) {
    const next: Record<string, AttendanceStatus> = {};
    for (const s of roster) {
      next[s.studentId] = status;
    }
    setStatuses(next);
  }

  async function handleSave() {
    if (!selectedClassId || roster.length === 0) return;
    setSaving(true);
    setMessage("");
    try {
      const cls = classes.find((c) => c.id === selectedClassId);
      const entries = roster.map((s) => ({
        studentId: s.studentId,
        status: statuses[s.studentId] || "present",
        remarks: remarks[s.studentId] || "",
      }));
      const savedCount = await saveAttendanceRoster({
        tenantId,
        classId: selectedClassId,
        className: cls?.name || "",
        date,
        markedBy: userId,
        markedByName: userName,
        entries,
      });
      setMessage(`Saved attendance for ${savedCount} students on ${date} to Firestore.`);
    } finally {
      setSaving(false);
    }
  }

  const counts = roster.reduce(
    (acc, s) => {
      const st = statuses[s.studentId] || "present";
      acc[st]++;
      return acc;
    },
    { present: 0, late: 0, absent: 0, excused: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Record Attendance</h1>
          <p className="text-sm text-slate-600">
            Select a class and date to mark or update student attendance.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || roster.length === 0}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 disabled:opacity-50 transition cursor-pointer"
        >
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Attendance
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Class / Batch
          </label>
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
          >
            {classes.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.studentCount || 0} students)
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2.5 text-sm font-medium text-slate-800 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {message && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
          {message}
        </div>
      )}

      {roster.length > 0 && (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="rounded-lg bg-emerald-100 px-2.5 py-1 text-emerald-800">
              Present: {counts.present}
            </span>
            <span className="rounded-lg bg-amber-100 px-2.5 py-1 text-amber-800">
              Late: {counts.late}
            </span>
            <span className="rounded-lg bg-red-100 px-2.5 py-1 text-red-800">
              Absent: {counts.absent}
            </span>
            <span className="rounded-lg bg-sky-100 px-2.5 py-1 text-sky-800">
              Excused: {counts.excused}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => markAll("present")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Mark All Present
            </button>
            <button
              type="button"
              onClick={() => markAll("absent")}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              Mark All Absent
            </button>
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading class roster...
          </div>
        ) : roster.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Users className="h-8 w-8 text-slate-300 mx-auto" />
            <p className="text-sm font-medium text-slate-700">
              No active students in this class yet.
            </p>
            <p className="text-xs text-slate-500">
              Add students under &ldquo;Student Profiles&rdquo; to start taking attendance.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {roster.map((student) => {
              const currentStatus = statuses[student.studentId] || "present";
              return (
                <div
                  key={student.studentId}
                  className="p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-slate-50/60 transition"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2.5">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                        {student.rollNumber}
                      </span>
                      <span className="font-semibold text-slate-900 truncate">
                        {student.name}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{student.email}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex flex-wrap gap-1.5">
                      {STATUS_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const isActive = currentStatus === opt.value;
                        return (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() =>
                              setStatuses((prev) => ({
                                ...prev,
                                [student.studentId]: opt.value,
                              }))
                            }
                            className={`inline-flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition cursor-pointer ${
                              isActive
                                ? opt.activeClass
                                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-100"
                            }`}
                          >
                            <Icon className="h-3.5 w-3.5" />
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>

                    <input
                      type="text"
                      value={remarks[student.studentId] || ""}
                      onChange={(e) =>
                        setRemarks((prev) => ({
                          ...prev,
                          [student.studentId]: e.target.value,
                        }))
                      }
                      placeholder="Optional remark..."
                      className="w-full sm:w-48 rounded-lg border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
