import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "institution_admin" && session.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const classId = searchParams.get("classId");
  const search = searchParams.get("search")?.trim().toLowerCase() || "";

  const db = getDb();
  let query = `
    SELECT sp.id, sp.user_id, sp.class_id, sp.roll_number, sp.guardian_name,
           sp.guardian_phone, sp.date_of_birth, sp.address, sp.enrollment_date,
           sp.notes, sp.status,
           u.name, u.email,
           c.name as class_name,
           COUNT(ar.id) as total_days,
           SUM(CASE WHEN ar.status = 'present' THEN 1 ELSE 0 END) as present_days,
           SUM(CASE WHEN ar.status = 'late' THEN 1 ELSE 0 END) as late_days,
           SUM(CASE WHEN ar.status = 'absent' THEN 1 ELSE 0 END) as absent_days,
           SUM(CASE WHEN ar.status = 'excused' THEN 1 ELSE 0 END) as excused_days
    FROM student_profiles sp
    JOIN users u ON u.id = sp.user_id
    LEFT JOIN classes c ON c.id = sp.class_id
    LEFT JOIN attendance_records ar ON ar.student_id = sp.id
    WHERE sp.tenant_id = ?
  `;
  const params: string[] = [session.tenantId];

  if (classId) {
    query += " AND sp.class_id = ?";
    params.push(classId);
  }
  if (search) {
    query += " AND (LOWER(u.name) LIKE ? OR LOWER(sp.roll_number) LIKE ? OR LOWER(u.email) LIKE ?)";
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }

  query += " GROUP BY sp.id ORDER BY sp.roll_number ASC, u.name ASC";

  const students = db.prepare(query).all(...params);
  return NextResponse.json({ students });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "institution_admin" && session.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "student123");
    const classId = body.classId ? String(body.classId) : null;
    const rollNumber = String(body.rollNumber || "").trim();
    const guardianName = String(body.guardianName || "").trim();
    const guardianPhone = String(body.guardianPhone || "").trim();
    const dateOfBirth = String(body.dateOfBirth || "").trim();
    const address = String(body.address || "").trim();
    const notes = String(body.notes || "").trim();

    if (!name || !email || !rollNumber) {
      return NextResponse.json(
        { error: "Student name, email, and roll number are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const existing = db
      .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
      .get(email);
    if (existing) {
      return NextResponse.json(
        { error: "A user with this email already exists." },
        { status: 409 }
      );
    }

    if (classId) {
      const cls = db
        .prepare("SELECT id FROM classes WHERE id = ? AND tenant_id = ?")
        .get(classId, session.tenantId);
      if (!cls) {
        return NextResponse.json({ error: "Invalid class selected." }, { status: 400 });
      }
    }

    const userId = crypto.randomUUID();
    const profileId = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.exec("BEGIN");
    try {
      db.prepare(
        "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'student')"
      ).run(userId, session.tenantId, name, email, passwordHash);

      db.prepare(
        `INSERT INTO student_profiles
          (id, tenant_id, user_id, class_id, roll_number, guardian_name, guardian_phone, date_of_birth, address, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).run(
        profileId,
        session.tenantId,
        userId,
        classId,
        rollNumber,
        guardianName,
        guardianPhone,
        dateOfBirth,
        address,
        notes
      );
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    return NextResponse.json(
      { id: profileId, userId, name, email, rollNumber },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create student error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
