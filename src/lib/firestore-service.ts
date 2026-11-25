import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from "firebase/firestore";
import { firebaseAuth, firestoreDb, getSecondaryAuth } from "@/lib/firebase";

export type UserRole = "super_admin" | "institution_admin" | "teacher" | "student";
export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export interface AppUser {
  uid: string;
  tenantId: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface TenantDoc {
  id: string;
  name: string;
  slug: string;
  plan: "starter" | "pro" | "enterprise";
  status: "active" | "suspended";
  adminEmail: string;
  createdAt: string;
}

export interface ClassDoc {
  id: string;
  tenantId: string;
  name: string;
  schedule: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  studentCount?: number;
}

export interface StudentProfileDoc {
  id: string;
  tenantId: string;
  userId: string;
  classId: string;
  className?: string;
  rollNumber: string;
  name: string;
  email: string;
  guardianName: string;
  guardianPhone: string;
  dateOfBirth: string;
  address: string;
  enrollmentDate: string;
  notes: string;
  status: "active" | "inactive";
  totalDays?: number;
  presentDays?: number;
  lateDays?: number;
  absentDays?: number;
  excusedDays?: number;
}

export interface AttendanceRecordDoc {
  id: string;
  tenantId: string;
  classId: string;
  className: string;
  studentId: string;
  date: string;
  status: AttendanceStatus;
  remarks: string;
  markedBy: string;
  markedByName: string;
  updatedAt: string;
}

export interface ActiveSession {
  user: AppUser;
  tenant: TenantDoc;
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/dashboard/super-admin";
    case "institution_admin":
      return "/dashboard/admin";
    case "teacher":
      return "/dashboard/teacher";
    case "student":
      return "/dashboard/student";
  }
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function loadSessionForUid(uid: string): Promise<ActiveSession | null> {
  const userSnap = await getDoc(doc(firestoreDb, "users", uid));
  if (!userSnap.exists()) return null;
  const user = userSnap.data() as AppUser;

  const tenantSnap = await getDoc(doc(firestoreDb, "tenants", user.tenantId));
  if (!tenantSnap.exists()) return null;
  const tenant = tenantSnap.data() as TenantDoc;

  return { user, tenant };
}

export async function signInWithFirebase(
  email: string,
  password: string
): Promise<{ session: ActiveSession; redirectTo: string }> {
  const cred = await signInWithEmailAndPassword(
    firebaseAuth,
    email.trim().toLowerCase(),
    password
  );
  const session = await loadSessionForUid(cred.user.uid);
  if (!session) {
    await signOut(firebaseAuth);
    throw new Error("User profile not found in Firestore. Please contact your administrator.");
  }
  if (session.user.role !== "super_admin" && session.tenant.status === "suspended") {
    await signOut(firebaseAuth);
    throw new Error("This institution workspace is currently suspended.");
  }
  return {
    session,
    redirectTo: getRoleDashboardPath(session.user.role),
  };
}

export async function signUpInstitutionWorkspace(params: {
  organizationName: string;
  name: string;
  email: string;
  password: string;
  plan: "starter" | "pro" | "enterprise";
}): Promise<{ tenant: TenantDoc; redirectTo: string }> {
  const email = params.email.trim().toLowerCase();
  const cred = await createUserWithEmailAndPassword(
    firebaseAuth,
    email,
    params.password
  );
  const uid = cred.user.uid;
  const tenantRef = doc(collection(firestoreDb, "tenants"));
  const tenantId = tenantRef.id;
  const now = new Date().toISOString();
  const slug = `${slugify(params.organizationName) || "academy"}-${tenantId.slice(0, 4)}`;

  const tenant: TenantDoc = {
    id: tenantId,
    name: params.organizationName.trim(),
    slug,
    plan: params.plan,
    status: "active",
    adminEmail: email,
    createdAt: now,
  };

  const userDoc: AppUser = {
    uid,
    tenantId,
    name: params.name.trim(),
    email,
    role: "institution_admin",
    createdAt: now,
  };

  const classRef = doc(collection(firestoreDb, "classes"));
  const defaultClass: ClassDoc = {
    id: classRef.id,
    tenantId,
    name: "General Class — Morning",
    schedule: "Mon–Fri • 09:00 AM",
    teacherId: uid,
    teacherName: params.name.trim(),
    createdAt: now,
  };

  await setDoc(tenantRef, tenant);
  await setDoc(doc(firestoreDb, "users", uid), userDoc);
  await setDoc(classRef, defaultClass);

  return { tenant, redirectTo: "/dashboard/admin" };
}

export async function signOutFirebase() {
  await signOut(firebaseAuth);
}

async function provisionAuthAccount(email: string, password: string): Promise<string> {
  const secondaryAuth = getSecondaryAuth();
  const cred = await createUserWithEmailAndPassword(
    secondaryAuth,
    email.trim().toLowerCase(),
    password
  );
  const uid = cred.user.uid;
  await signOut(secondaryAuth);
  return uid;
}

export async function fetchClasses(tenantId: string): Promise<ClassDoc[]> {
  const [classSnap, studentSnap] = await Promise.all([
    getDocs(query(collection(firestoreDb, "classes"), where("tenantId", "==", tenantId))),
    getDocs(
      query(
        collection(firestoreDb, "student_profiles"),
        where("tenantId", "==", tenantId),
        where("status", "==", "active")
      )
    ),
  ]);

  const counts: Record<string, number> = {};
  studentSnap.forEach((d) => {
    const data = d.data() as StudentProfileDoc;
    if (data.classId) {
      counts[data.classId] = (counts[data.classId] || 0) + 1;
    }
  });

  return classSnap.docs
    .map((d) => {
      const c = d.data() as ClassDoc;
      return { ...c, studentCount: counts[c.id] || 0 };
    })
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function createClass(
  tenantId: string,
  params: { name: string; schedule: string; teacherId: string; teacherName: string }
): Promise<ClassDoc> {
  const ref = doc(collection(firestoreDb, "classes"));
  const cls: ClassDoc = {
    id: ref.id,
    tenantId,
    name: params.name.trim(),
    schedule: params.schedule.trim(),
    teacherId: params.teacherId,
    teacherName: params.teacherName,
    createdAt: new Date().toISOString(),
  };
  await setDoc(ref, cls);
  return cls;
}

export async function fetchStudents(
  tenantId: string,
  filters?: { classId?: string; search?: string }
): Promise<StudentProfileDoc[]> {
  const [studentsSnap, classesSnap, attendanceSnap] = await Promise.all([
    getDocs(
      query(collection(firestoreDb, "student_profiles"), where("tenantId", "==", tenantId))
    ),
    getDocs(query(collection(firestoreDb, "classes"), where("tenantId", "==", tenantId))),
    getDocs(
      query(collection(firestoreDb, "attendance_records"), where("tenantId", "==", tenantId))
    ),
  ]);

  const classMap: Record<string, string> = {};
  classesSnap.forEach((d) => {
    const c = d.data() as ClassDoc;
    classMap[c.id] = c.name;
  });

  const statsMap: Record<
    string,
    { total: number; present: number; late: number; absent: number; excused: number }
  > = {};
  attendanceSnap.forEach((d) => {
    const r = d.data() as AttendanceRecordDoc;
    if (!statsMap[r.studentId]) {
      statsMap[r.studentId] = { total: 0, present: 0, late: 0, absent: 0, excused: 0 };
    }
    statsMap[r.studentId].total++;
    statsMap[r.studentId][r.status]++;
  });

  let list = studentsSnap.docs.map((d) => {
    const s = d.data() as StudentProfileDoc;
    const st = statsMap[s.id] || { total: 0, present: 0, late: 0, absent: 0, excused: 0 };
    return {
      ...s,
      className: s.classId ? classMap[s.classId] || "" : "",
      totalDays: st.total,
      presentDays: st.present,
      lateDays: st.late,
      absentDays: st.absent,
      excusedDays: st.excused,
    };
  });

  if (filters?.classId) {
    list = list.filter((s) => s.classId === filters.classId);
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.rollNumber.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q)
    );
  }

  return list.sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}

export async function createStudent(
  tenantId: string,
  params: {
    name: string;
    email: string;
    password?: string;
    rollNumber: string;
    classId: string;
    guardianName: string;
    guardianPhone: string;
    dateOfBirth: string;
    address: string;
    notes: string;
  }
): Promise<StudentProfileDoc> {
  const email = params.email.trim().toLowerCase();
  const password = params.password?.trim() || "student123";
  const uid = await provisionAuthAccount(email, password);
  const now = new Date().toISOString();

  const userDoc: AppUser = {
    uid,
    tenantId,
    name: params.name.trim(),
    email,
    role: "student",
    createdAt: now,
  };

  const profile: StudentProfileDoc = {
    id: uid,
    tenantId,
    userId: uid,
    classId: params.classId || "",
    rollNumber: params.rollNumber.trim(),
    name: params.name.trim(),
    email,
    guardianName: params.guardianName.trim(),
    guardianPhone: params.guardianPhone.trim(),
    dateOfBirth: params.dateOfBirth.trim(),
    address: params.address.trim(),
    enrollmentDate: now.slice(0, 10),
    notes: params.notes.trim(),
    status: "active",
  };

  await setDoc(doc(firestoreDb, "users", uid), userDoc);
  await setDoc(doc(firestoreDb, "student_profiles", uid), profile);
  return profile;
}

export async function fetchStudentAttendanceHistory(
  tenantId: string,
  studentId: string
): Promise<AttendanceRecordDoc[]> {
  const snap = await getDocs(
    query(
      collection(firestoreDb, "attendance_records"),
      where("tenantId", "==", tenantId),
      where("studentId", "==", studentId)
    )
  );
  return snap.docs
    .map((d) => d.data() as AttendanceRecordDoc)
    .sort((a, b) => b.date.localeCompare(a.date));
}

export async function updateStudentProfile(
  studentId: string,
  patch: Partial<StudentProfileDoc>
) {
  await updateDoc(doc(firestoreDb, "student_profiles", studentId), patch);
  if (patch.name) {
    await updateDoc(doc(firestoreDb, "users", studentId), { name: patch.name });
  }
}

export async function fetchAttendanceRoster(
  tenantId: string,
  classId: string,
  date: string
): Promise<
  Array<{
    studentId: string;
    rollNumber: string;
    name: string;
    email: string;
    attendanceStatus: AttendanceStatus | null;
    remarks: string;
  }>
> {
  const [studentsSnap, recordsSnap] = await Promise.all([
    getDocs(
      query(
        collection(firestoreDb, "student_profiles"),
        where("tenantId", "==", tenantId),
        where("classId", "==", classId),
        where("status", "==", "active")
      )
    ),
    getDocs(
      query(
        collection(firestoreDb, "attendance_records"),
        where("tenantId", "==", tenantId),
        where("classId", "==", classId),
        where("date", "==", date)
      )
    ),
  ]);

  const recordByStudent: Record<string, AttendanceRecordDoc> = {};
  recordsSnap.forEach((d) => {
    const r = d.data() as AttendanceRecordDoc;
    recordByStudent[r.studentId] = r;
  });

  return studentsSnap.docs
    .map((d) => {
      const s = d.data() as StudentProfileDoc;
      const rec = recordByStudent[s.id];
      return {
        studentId: s.id,
        rollNumber: s.rollNumber,
        name: s.name,
        email: s.email,
        attendanceStatus: rec ? rec.status : null,
        remarks: rec ? rec.remarks : "",
      };
    })
    .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}

export async function saveAttendanceRoster(params: {
  tenantId: string;
  classId: string;
  className: string;
  date: string;
  markedBy: string;
  markedByName: string;
  entries: Array<{ studentId: string; status: AttendanceStatus; remarks: string }>;
}) {
  const batch = writeBatch(firestoreDb);
  const now = new Date().toISOString();

  for (const entry of params.entries) {
    const recordId = `${params.tenantId}_${params.classId}_${entry.studentId}_${params.date}`;
    const ref = doc(firestoreDb, "attendance_records", recordId);
    const docData: AttendanceRecordDoc = {
      id: recordId,
      tenantId: params.tenantId,
      classId: params.classId,
      className: params.className,
      studentId: entry.studentId,
      date: params.date,
      status: entry.status,
      remarks: entry.remarks.trim(),
      markedBy: params.markedBy,
      markedByName: params.markedByName,
      updatedAt: now,
    };
    batch.set(ref, docData, { merge: true });
  }

  await batch.commit();
  return params.entries.length;
}

export async function fetchMyStudentPortal(tenantId: string, uid: string) {
  const profileSnap = await getDoc(doc(firestoreDb, "student_profiles", uid));
  if (!profileSnap.exists()) return null;
  const profile = profileSnap.data() as StudentProfileDoc;

  let classInfo: ClassDoc | null = null;
  if (profile.classId) {
    const classSnap = await getDoc(doc(firestoreDb, "classes", profile.classId));
    if (classSnap.exists()) {
      classInfo = classSnap.data() as ClassDoc;
    }
  }

  const records = await fetchStudentAttendanceHistory(tenantId, uid);
  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    absent: records.filter((r) => r.status === "absent").length,
    excused: records.filter((r) => r.status === "excused").length,
    attendanceRate:
      records.length > 0
        ? Math.round(
            (records.filter((r) => r.status === "present" || r.status === "late").length /
              records.length) *
              100
          )
        : 100,
  };

  return { profile, classInfo, summary, records };
}

export async function fetchInstitutionOverview(tenantId: string) {
  const [tenantSnap, usersSnap, classes, studentsSnap, attendanceSnap] =
    await Promise.all([
      getDoc(doc(firestoreDb, "tenants", tenantId)),
      getDocs(query(collection(firestoreDb, "users"), where("tenantId", "==", tenantId))),
      fetchClasses(tenantId),
      getDocs(
        query(
          collection(firestoreDb, "student_profiles"),
          where("tenantId", "==", tenantId),
          where("status", "==", "active")
        )
      ),
      getDocs(
        query(collection(firestoreDb, "attendance_records"), where("tenantId", "==", tenantId))
      ),
    ]);

  const tenant = tenantSnap.data() as TenantDoc;
  const teachers = usersSnap.docs
    .map((d) => d.data() as AppUser)
    .filter((u) => u.role === "teacher")
    .map((t) => ({
      ...t,
      classCount: classes.filter((c) => c.teacherId === t.uid).length,
    }));

  const attended = attendanceSnap.docs.filter((d) => {
    const st = (d.data() as AttendanceRecordDoc).status;
    return st === "present" || st === "late";
  }).length;

  return {
    tenant,
    teachers,
    classes,
    stats: {
      totalStudents: studentsSnap.size,
      totalTeachers: teachers.length,
      totalClasses: classes.length,
      totalRecords: attendanceSnap.size,
      attendedRecords: attended,
    },
  };
}

export async function createTeacherAccount(
  tenantId: string,
  params: { name: string; email: string; password?: string }
) {
  const email = params.email.trim().toLowerCase();
  const uid = await provisionAuthAccount(email, params.password?.trim() || "teacher123");
  const teacher: AppUser = {
    uid,
    tenantId,
    name: params.name.trim(),
    email,
    role: "teacher",
    createdAt: new Date().toISOString(),
  };
  await setDoc(doc(firestoreDb, "users", uid), teacher);
  return teacher;
}

export async function updateTenantPlan(
  tenantId: string,
  plan: "starter" | "pro" | "enterprise"
) {
  await updateDoc(doc(firestoreDb, "tenants", tenantId), { plan });
}

export async function fetchAllTenantsForSuperAdmin() {
  const [tenantsSnap, studentsSnap, usersSnap, classesSnap, attendanceSnap] =
    await Promise.all([
      getDocs(collection(firestoreDb, "tenants")),
      getDocs(collection(firestoreDb, "student_profiles")),
      getDocs(collection(firestoreDb, "users")),
      getDocs(collection(firestoreDb, "classes")),
      getDocs(collection(firestoreDb, "attendance_records")),
    ]);

  const tenants = tenantsSnap.docs
    .map((d) => d.data() as TenantDoc)
    .filter((t) => t.slug !== "attendflow-hq")
    .map((t) => ({
      ...t,
      studentCount: studentsSnap.docs.filter(
        (d) => (d.data() as StudentProfileDoc).tenantId === t.id
      ).length,
      teacherCount: usersSnap.docs.filter((d) => {
        const u = d.data() as AppUser;
        return u.tenantId === t.id && u.role === "teacher";
      }).length,
      classCount: classesSnap.docs.filter(
        (d) => (d.data() as ClassDoc).tenantId === t.id
      ).length,
      attendanceCount: attendanceSnap.docs.filter(
        (d) => (d.data() as AttendanceRecordDoc).tenantId === t.id
      ).length,
    }));

  const summary = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === "active").length,
    totalStudents: tenants.reduce((acc, t) => acc + t.studentCount, 0),
    totalAttendance: tenants.reduce((acc, t) => acc + t.attendanceCount, 0),
  };

  return { tenants, summary };
}

export async function updateTenantBySuperAdmin(
  tenantId: string,
  patch: Partial<Pick<TenantDoc, "plan" | "status">>
) {
  await updateDoc(doc(firestoreDb, "tenants", tenantId), patch);
}

export async function provisionTenantBySuperAdmin(params: {
  organizationName: string;
  adminName: string;
  adminEmail: string;
  password?: string;
  plan: "starter" | "pro" | "enterprise";
}) {
  const email = params.adminEmail.trim().toLowerCase();
  const uid = await provisionAuthAccount(email, params.password?.trim() || "admin1234");
  const tenantRef = doc(collection(firestoreDb, "tenants"));
  const tenantId = tenantRef.id;
  const now = new Date().toISOString();
  const slug = `${slugify(params.organizationName) || "academy"}-${tenantId.slice(0, 4)}`;

  const tenant: TenantDoc = {
    id: tenantId,
    name: params.organizationName.trim(),
    slug,
    plan: params.plan,
    status: "active",
    adminEmail: email,
    createdAt: now,
  };

  const adminDoc: AppUser = {
    uid,
    tenantId,
    name: params.adminName.trim(),
    email,
    role: "institution_admin",
    createdAt: now,
  };

  const classRef = doc(collection(firestoreDb, "classes"));
  const defaultClass: ClassDoc = {
    id: classRef.id,
    tenantId,
    name: "General Class — Morning",
    schedule: "Mon–Fri • 09:00 AM",
    teacherId: uid,
    teacherName: params.adminName.trim(),
    createdAt: now,
  };

  await setDoc(tenantRef, tenant);
  await setDoc(doc(firestoreDb, "users", uid), adminDoc);
  await setDoc(classRef, defaultClass);

  return tenant;
}
