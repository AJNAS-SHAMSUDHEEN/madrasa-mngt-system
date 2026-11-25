import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  _request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  const db = getDb();

  const student = db
    .prepare(
      `SELECT sp.id, sp.user_id, sp.class_id, sp.roll_number, sp.guardian_name,
              sp.guardian_phone, sp.date_of_birth, sp.address, sp.enrollment_date,
              sp.notes, sp.status,
              u.name, u.email,
              c.name as class_name, c.schedule as class_schedule
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       LEFT JOIN classes c ON c.id = sp.class_id
       WHERE sp.id = ? AND sp.tenant_id = ?`
    )
    .get(id, session.tenantId) as
    | {
        id: string;
        user_id: string;
        [key: string]: unknown;
      }
    | undefined;

  if (!student) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  if (session.role === "student" && student.user_id !== session.userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const records = db
    .prepare(
      `SELECT ar.id, ar.date, ar.status, ar.remarks, ar.updated_at,
              c.name as class_name, u.name as marked_by_name
       FROM attendance_records ar
       LEFT JOIN classes c ON c.id = ar.class_id
       LEFT JOIN users u ON u.id = ar.marked_by
       WHERE ar.student_id = ? AND ar.tenant_id = ?
       ORDER BY ar.date DESC
       LIMIT 90`
    )
    .all(id, session.tenantId);

  return NextResponse.json({ student, records });
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "institution_admin" && session.role !== "teacher") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await context.params;
  const body = await request.json();
  const db = getDb();

  const existing = db
    .prepare(
      "SELECT id, user_id FROM student_profiles WHERE id = ? AND tenant_id = ?"
    )
    .get(id, session.tenantId) as { id: string; user_id: string } | undefined;

  if (!existing) {
    return NextResponse.json({ error: "Student not found." }, { status: 404 });
  }

  const name = body.name !== undefined ? String(body.name).trim() : null;
  const classId = body.classId !== undefined ? (body.classId ? String(body.classId) : null) : undefined;
  const rollNumber = body.rollNumber !== undefined ? String(body.rollNumber).trim() : null;
  const guardianName = body.guardianName !== undefined ? String(body.guardianName).trim() : null;
  const guardianPhone = body.guardianPhone !== undefined ? String(body.guardianPhone).trim() : null;
  const dateOfBirth = body.dateOfBirth !== undefined ? String(body.dateOfBirth).trim() : null;
  const address = body.address !== undefined ? String(body.address).trim() : null;
  const notes = body.notes !== undefined ? String(body.notes).trim() : null;
  const status = body.status === "inactive" ? "inactive" : body.status === "active" ? "active" : null;

  db.exec("BEGIN");
  try {
    if (name) {
      db.prepare("UPDATE users SET name = ? WHERE id = ? AND tenant_id = ?").run(
        name,
        existing.user_id,
        session.tenantId
      );
    }

    db.prepare(
      `UPDATE student_profiles
       SET class_id = COALESCE(?, class_id),
           roll_number = COALESCE(?, roll_number),
           guardian_name = COALESCE(?, guardian_name),
           guardian_phone = COALESCE(?, guardian_phone),
           date_of_birth = COALESCE(?, date_of_birth),
           address = COALESCE(?, address),
           notes = COALESCE(?, notes),
           status = COALESCE(?, status)
       WHERE id = ? AND tenant_id = ?`
    ).run(
      classId === undefined ? null : classId,
      rollNumber,
      guardianName,
      guardianPhone,
      dateOfBirth,
      address,
      notes,
      status,
      id,
      session.tenantId
    );
    db.exec("COMMIT");
  } catch (err) {
    db.exec("ROLLBACK");
    throw err;
  }

  return NextResponse.json({ ok: true });
}
