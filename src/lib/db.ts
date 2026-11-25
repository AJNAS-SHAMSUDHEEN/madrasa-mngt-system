import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const DATA_DIR = path.join(process.cwd(), "data");
const DB_PATH = path.join(DATA_DIR, "attendflow.db");

declare global {
  var __attendanceDb: DatabaseSync | undefined;
}

function createDatabase(): DatabaseSync {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      slug TEXT NOT NULL UNIQUE,
      plan TEXT NOT NULL DEFAULT 'starter',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('super_admin', 'institution_admin', 'teacher', 'student')),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS classes (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      name TEXT NOT NULL,
      schedule TEXT NOT NULL DEFAULT '',
      teacher_id TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      FOREIGN KEY (teacher_id) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS student_profiles (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      user_id TEXT NOT NULL UNIQUE,
      class_id TEXT,
      roll_number TEXT NOT NULL,
      guardian_name TEXT NOT NULL DEFAULT '',
      guardian_phone TEXT NOT NULL DEFAULT '',
      date_of_birth TEXT NOT NULL DEFAULT '',
      address TEXT NOT NULL DEFAULT '',
      enrollment_date TEXT NOT NULL DEFAULT (date('now')),
      notes TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS attendance_records (
      id TEXT PRIMARY KEY,
      tenant_id TEXT NOT NULL,
      class_id TEXT NOT NULL,
      student_id TEXT NOT NULL,
      date TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
      remarks TEXT NOT NULL DEFAULT '',
      marked_by TEXT,
      updated_at TEXT NOT NULL DEFAULT (datetime('now')),
      UNIQUE (tenant_id, class_id, student_id, date),
      FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE CASCADE,
      FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
      FOREIGN KEY (student_id) REFERENCES student_profiles(id) ON DELETE CASCADE,
      FOREIGN KEY (marked_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_users_tenant ON users(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_classes_tenant ON classes(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_students_tenant ON student_profiles(tenant_id);
    CREATE INDEX IF NOT EXISTS idx_attendance_tenant_date ON attendance_records(tenant_id, date);
    CREATE INDEX IF NOT EXISTS idx_attendance_student ON attendance_records(student_id, date);
  `);

  seedDemoData(db);
  return db;
}

function seedDemoData(db: DatabaseSync) {
  const row = db.prepare("SELECT COUNT(*) as count FROM tenants").get() as { count: number };
  if (row.count > 0) return;

  const platformTenantId = crypto.randomUUID();
  const tenant1Id = crypto.randomUUID();
  const tenant2Id = crypto.randomUUID();

  const superAdminId = crypto.randomUUID();
  const admin1Id = crypto.randomUUID();
  const teacher1Id = crypto.randomUUID();
  const admin2Id = crypto.randomUUID();

  const class1Id = crypto.randomUUID();
  const class2Id = crypto.randomUUID();
  const class3Id = crypto.randomUUID();

  const demoHash = bcrypt.hashSync("demo1234", 10);

  // Platform tenant for Super Admin
  db.prepare(
    "INSERT INTO tenants (id, name, slug, plan, status) VALUES (?, ?, ?, ?, 'active')"
  ).run(platformTenantId, "AttendFlow Platform HQ", "attendflow-hq", "enterprise");

  db.prepare(
    "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'super_admin')"
  ).run(superAdminId, platformTenantId, "Platform Super Admin", "superadmin@attendflow.saas", demoHash);

  // Institution 1: Al-Noor Academy
  db.prepare(
    "INSERT INTO tenants (id, name, slug, plan, status) VALUES (?, ?, ?, ?, 'active')"
  ).run(tenant1Id, "Al-Noor Academy", "al-noor-academy", "pro");

  db.prepare(
    "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'institution_admin')"
  ).run(admin1Id, tenant1Id, "Amina Hassan", "admin@alnoor.edu", demoHash);

  db.prepare(
    "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'teacher')"
  ).run(teacher1Id, tenant1Id, "Ustadh Tariq Mahmood", "teacher@alnoor.edu", demoHash);

  db.prepare(
    "INSERT INTO classes (id, tenant_id, name, schedule, teacher_id) VALUES (?, ?, ?, ?, ?)"
  ).run(class1Id, tenant1Id, "Hifz & Tajweed — Morning", "Mon–Fri • 08:00 AM", teacher1Id);

  db.prepare(
    "INSERT INTO classes (id, tenant_id, name, schedule, teacher_id) VALUES (?, ?, ?, ?, ?)"
  ).run(class2Id, tenant1Id, "Arabic & Fiqh — Evening", "Mon–Thu • 05:00 PM", teacher1Id);

  // Institution 2: Madina Learning Center (so Super Admin sees multiple SaaS tenants)
  db.prepare(
    "INSERT INTO tenants (id, name, slug, plan, status) VALUES (?, ?, ?, ?, 'active')"
  ).run(tenant2Id, "Madina Learning Center", "madina-learning", "starter");

  db.prepare(
    "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'institution_admin')"
  ).run(admin2Id, tenant2Id, "Kareem Abdullah", "admin@madina.edu", demoHash);

  db.prepare(
    "INSERT INTO classes (id, tenant_id, name, schedule, teacher_id) VALUES (?, ?, ?, ?, ?)"
  ).run(class3Id, tenant2Id, "Weekend Quran Circle", "Sat–Sun • 10:00 AM", admin2Id);

  const demoStudents = [
    {
      name: "Yusuf Ali",
      email: "student@alnoor.edu",
      roll: "AN-101",
      classId: class1Id,
      guardian: "Imran Ali",
      phone: "+1 (555) 234-5678",
      dob: "2012-04-15",
      address: "142 Crescent Ave, Springfield",
      notes: "Completed Juz 30 with distinction.",
    },
    {
      name: "Zainab Omar",
      email: "zainab@alnoor.edu",
      roll: "AN-102",
      classId: class1Id,
      guardian: "Fatima Omar",
      phone: "+1 (555) 345-6789",
      dob: "2011-09-22",
      address: "88 Oakwood Dr, Springfield",
      notes: "Strong recitation fluency.",
    },
    {
      name: "Bilal Siddiqui",
      email: "bilal@alnoor.edu",
      roll: "AN-103",
      classId: class1Id,
      guardian: "Kamran Siddiqui",
      phone: "+1 (555) 456-7890",
      dob: "2013-01-08",
      address: "19 Maple Lane, Springfield",
      notes: "Needs extra practice on Madd rules.",
    },
    {
      name: "Maryam Khan",
      email: "maryam@alnoor.edu",
      roll: "AN-104",
      classId: class1Id,
      guardian: "Tariq Khan",
      phone: "+1 (555) 567-8901",
      dob: "2012-07-30",
      address: "305 Pine St, Springfield",
      notes: "Consistent attendance and homework.",
    },
    {
      name: "Hamza Patel",
      email: "hamza@alnoor.edu",
      roll: "AN-201",
      classId: class2Id,
      guardian: "Sajid Patel",
      phone: "+1 (555) 678-9012",
      dob: "2010-11-12",
      address: "74 Cedar Ct, Springfield",
      notes: "Excelling in Arabic grammar.",
    },
    {
      name: "Aisha Rahman",
      email: "aisha@alnoor.edu",
      roll: "AN-202",
      classId: class2Id,
      guardian: "Nadia Rahman",
      phone: "+1 (555) 789-0123",
      dob: "2011-03-04",
      address: "210 Willow Way, Springfield",
      notes: "Active participant in class discussions.",
    },
  ];

  const insertUser = db.prepare(
    "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'student')"
  );
  const insertProfile = db.prepare(
    `INSERT INTO student_profiles
      (id, tenant_id, user_id, class_id, roll_number, guardian_name, guardian_phone, date_of_birth, address, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  );
  const insertAttendance = db.prepare(
    `INSERT INTO attendance_records
      (id, tenant_id, class_id, student_id, date, status, remarks, marked_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  );

  const statuses: Array<"present" | "absent" | "late" | "excused"> = [
    "present",
    "present",
    "present",
    "present",
    "late",
    "present",
    "excused",
    "present",
    "absent",
    "present",
  ];

  demoStudents.forEach((student, idx) => {
    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    insertUser.run(userId, tenant1Id, student.name, student.email, demoHash);
    insertProfile.run(
      profileId,
      tenant1Id,
      userId,
      student.classId,
      student.roll,
      student.guardian,
      student.phone,
      student.dob,
      student.address,
      student.notes
    );

    for (let d = 9; d >= 0; d--) {
      const dateObj = new Date();
      dateObj.setDate(dateObj.getDate() - d);
      const dateStr = dateObj.toISOString().slice(0, 10);
      const status = statuses[(idx + d) % statuses.length];
      const remark =
        status === "late"
          ? "Arrived 10 mins late"
          : status === "excused"
            ? "Family appointment"
            : status === "absent"
              ? "Unexcused absence"
              : "";
      insertAttendance.run(
        crypto.randomUUID(),
        tenant1Id,
        student.classId,
        profileId,
        dateStr,
        status,
        remark,
        teacher1Id
      );
    }
  });
}

export function getDb(): DatabaseSync {
  if (!globalThis.__attendanceDb) {
    globalThis.__attendanceDb = createDatabase();
  }
  return globalThis.__attendanceDb;
}
