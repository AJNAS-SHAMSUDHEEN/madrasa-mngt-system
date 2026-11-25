"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Search,
  UserPlus,
  X,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  Loader2,
  Save,
} from "lucide-react";
import {
  AttendanceRecordDoc,
  ClassDoc,
  createStudent,
  fetchClasses,
  fetchStudentAttendanceHistory,
  fetchStudents,
  StudentProfileDoc,
  updateStudentProfile,
} from "@/lib/firestore-service";

interface StudentProfilesClientProps {
  tenantId: string;
}

export default function StudentProfilesClient({ tenantId }: StudentProfilesClientProps) {
  const [students, setStudents] = useState<StudentProfileDoc[]>([]);
  const [classes, setClasses] = useState<ClassDoc[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [newStudent, setNewStudent] = useState({
    name: "",
    email: "",
    password: "",
    rollNumber: "",
    classId: "",
    guardianName: "",
    guardianPhone: "",
    dateOfBirth: "",
    address: "",
    notes: "",
  });

  const [selectedStudent, setSelectedStudent] = useState<StudentProfileDoc | null>(null);
  const [studentHistory, setStudentHistory] = useState<AttendanceRecordDoc[]>([]);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editForm, setEditForm] = useState({
    name: "",
    rollNumber: "",
    classId: "",
    guardianName: "",
    guardianPhone: "",
    dateOfBirth: "",
    address: "",
    notes: "",
    status: "active" as "active" | "inactive",
  });

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const list = await fetchStudents(tenantId, {
        classId: classFilter || undefined,
        search: search.trim() || undefined,
      });
      setStudents(list);
    } finally {
      setLoading(false);
    }
  }, [tenantId, classFilter, search]);

  useEffect(() => {
    fetchClasses(tenantId).then((list) => {
      setClasses(list);
      if (list.length > 0) {
        setNewStudent((prev) => ({ ...prev, classId: list[0].id }));
      }
    });
  }, [tenantId]);

  useEffect(() => {
    loadStudents();
  }, [loadStudents]);

  async function handleCreateStudent(e: React.FormEvent) {
    e.preventDefault();
    setFormError("");
    setCreating(true);
    try {
      await createStudent(tenantId, newStudent);
      setShowAddModal(false);
      setNewStudent({
        name: "",
        email: "",
        password: "",
        rollNumber: "",
        classId: classes[0]?.id || "",
        guardianName: "",
        guardianPhone: "",
        dateOfBirth: "",
        address: "",
        notes: "",
      });
      loadStudents();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : "Could not create student.");
    } finally {
      setCreating(false);
    }
  }

  async function openProfile(student: StudentProfileDoc) {
    setSelectedStudent(student);
    setEditForm({
      name: student.name,
      rollNumber: student.rollNumber,
      classId: student.classId || "",
      guardianName: student.guardianName || "",
      guardianPhone: student.guardianPhone || "",
      dateOfBirth: student.dateOfBirth || "",
      address: student.address || "",
      notes: student.notes || "",
      status: student.status,
    });
    const records = await fetchStudentAttendanceHistory(tenantId, student.id);
    setStudentHistory(records);
  }

  async function handleSaveEdit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedStudent) return;
    setSavingEdit(true);
    try {
      await updateStudentProfile(selectedStudent.id, editForm);
      setSelectedStudent(null);
      loadStudents();
    } finally {
      setSavingEdit(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Student Profiles</h1>
          <p className="text-sm text-slate-600">
            Manage student details, guardian contacts, and view attendance records in Firestore.
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700 transition cursor-pointer"
        >
          <UserPlus className="h-4 w-4" />
          Add Student
        </button>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, roll number, or email..."
            className="w-full rounded-xl border border-slate-300 pl-9 pr-3.5 py-2 text-sm focus:border-emerald-500 focus:outline-none"
          />
        </div>
        <select
          value={classFilter}
          onChange={(e) => setClassFilter(e.target.value)}
          className="rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-sm text-slate-800 focus:border-emerald-500 focus:outline-none"
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="p-12 text-center text-sm text-slate-500 flex items-center justify-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading student profiles...
        </div>
      ) : students.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-sm text-slate-500">
          No students found matching your filter.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {students.map((s) => {
            const total = Number(s.totalDays || 0);
            const attended = Number(s.presentDays || 0) + Number(s.lateDays || 0);
            const rate = total > 0 ? Math.round((attended / total) * 100) : 100;

            return (
              <div
                key={s.id}
                onClick={() => openProfile(s)}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-400 hover:shadow-md transition cursor-pointer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 font-mono text-xs font-semibold text-slate-700">
                        {s.rollNumber}
                      </span>
                      <h3 className="font-bold text-slate-900">{s.name}</h3>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">{s.email}</p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                      rate >= 85
                        ? "bg-emerald-100 text-emerald-800"
                        : rate >= 70
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {rate}% Attendance
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5 truncate">
                    <BookOpen className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.className || "Unassigned"}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{s.guardianPhone || "No phone"}</span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>
                    Guardian: <strong className="text-slate-700">{s.guardianName || "—"}</strong>
                  </span>
                  <span className="text-emerald-600 font-semibold">View & Edit →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">Add New Student</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateStudent} className="space-y-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={newStudent.name}
                    onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AN-105"
                    value={newStudent.rollNumber}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, rollNumber: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Student Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={newStudent.email}
                    onChange={(e) => setNewStudent({ ...newStudent, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Login Password
                  </label>
                  <input
                    type="text"
                    placeholder="Default: student123"
                    value={newStudent.password}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, password: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class / Batch
                </label>
                <select
                  value={newStudent.classId}
                  onChange={(e) => setNewStudent({ ...newStudent, classId: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                >
                  <option value="">Unassigned</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={newStudent.guardianName}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, guardianName: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={newStudent.guardianPhone}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, guardianPhone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Date of Birth
                  </label>
                  <input
                    type="date"
                    value={newStudent.dateOfBirth}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, dateOfBirth: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Address
                  </label>
                  <input
                    type="text"
                    value={newStudent.address}
                    onChange={(e) =>
                      setNewStudent({ ...newStudent, address: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Teacher Notes
                </label>
                <textarea
                  rows={2}
                  value={newStudent.notes}
                  onChange={(e) => setNewStudent({ ...newStudent, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                >
                  {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                  Create Student
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Student Profile — {selectedStudent.name}
                </h2>
                <p className="text-xs text-slate-500">{selectedStudent.email}</p>
              </div>
              <button
                onClick={() => setSelectedStudent(null)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 border-b border-slate-200 pb-6">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Roll Number
                  </label>
                  <input
                    type="text"
                    required
                    value={editForm.rollNumber}
                    onChange={(e) => setEditForm({ ...editForm, rollNumber: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class</label>
                  <select
                    value={editForm.classId}
                    onChange={(e) => setEditForm({ ...editForm, classId: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm"
                  >
                    <option value="">Unassigned</option>
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian Name
                  </label>
                  <input
                    type="text"
                    value={editForm.guardianName}
                    onChange={(e) => setEditForm({ ...editForm, guardianName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Guardian Phone
                  </label>
                  <input
                    type="text"
                    value={editForm.guardianPhone}
                    onChange={(e) =>
                      setEditForm({ ...editForm, guardianPhone: e.target.value })
                    }
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="h-3 w-3" /> Date of Birth
                    </span>
                  </label>
                  <input
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(e) => setEditForm({ ...editForm, dateOfBirth: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="h-3 w-3" /> Address
                    </span>
                  </label>
                  <input
                    type="text"
                    value={editForm.address}
                    onChange={(e) => setEditForm({ ...editForm, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows={2}
                  value={editForm.notes}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60 cursor-pointer"
                >
                  {savingEdit ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Profile Changes
                </button>
              </div>
            </form>

            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-3">
                Recent Attendance History
              </h3>
              {studentHistory.length === 0 ? (
                <p className="text-xs text-slate-500">No attendance records yet.</p>
              ) : (
                <div className="max-h-56 overflow-y-auto rounded-xl border border-slate-200 divide-y divide-slate-100">
                  {studentHistory.map((rec) => (
                    <div
                      key={rec.id}
                      className="flex items-center justify-between px-3.5 py-2.5 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="font-mono font-semibold text-slate-700">
                          {rec.date}
                        </span>
                        <span className="text-slate-500">{rec.className}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {rec.remarks && (
                          <span className="text-slate-500 italic">{rec.remarks}</span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 font-semibold capitalize ${
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
