import { NextResponse } from "next/server";
import crypto from "node:crypto";
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
  const date = searchParams.get("date") || new Date().toISOString().slice(0, 10);

  if (!classId) {
    return NextResponse.json({ error: "classId is required." }, { status: 400 });
  }

  const db = getDb();
  const rows = db
    .prepare(
      `SELECT sp.id as student_id, sp.roll_number, u.name, u.email,
              ar.status as attendance_status, ar.remarks, ar.updated_at
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       LEFT JOIN attendance_records ar
         ON ar.student_id = sp.id
        AND ar.class_id = ?
        AND ar.date = ?
        AND ar.tenant_id = ?
       WHERE sp.tenant_id = ? AND sp.class_id = ? AND sp.status = 'active'
       ORDER BY sp.roll_number ASC, u.name ASC`
    )
    .all(classId, date, session.tenantId, session.tenantId, classId);

  return NextResponse.json({ date, classId, roster: rows });
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
    const classId = String(body.classId || "");
    const date = String(body.date || "");
    const entries = Array.isArray(body.entries) ? body.entries : [];

    if (!classId || !/^\d{4}-\d{2}-\d{2}$/.test(date) || entries.length === 0) {
      return NextResponse.json(
        { error: "classId, valid YYYY-MM-DD date, and entries are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const cls = db
      .prepare("SELECT id FROM classes WHERE id = ? AND tenant_id = ?")
      .get(classId, session.tenantId);
    if (!cls) {
      return NextResponse.json({ error: "Class not found." }, { status: 404 });
    }

    const upsert = db.prepare(`
      INSERT INTO attendance_records (id, tenant_id, class_id, student_id, date, status, remarks, marked_by, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      ON CONFLICT(tenant_id, class_id, student_id, date)
      DO UPDATE SET
        status = excluded.status,
        remarks = excluded.remarks,
        marked_by = excluded.marked_by,
        updated_at = datetime('now')
    `);

    const validStatuses = new Set(["present", "absent", "late", "excused"]);
    let savedCount = 0;

    db.exec("BEGIN");
    try {
      for (const entry of entries) {
        const studentId = String(entry.studentId || "");
        const status = String(entry.status || "");
        const remarks = String(entry.remarks || "").trim();
        if (!studentId || !validStatuses.has(status)) continue;

        upsert.run(
          crypto.randomUUID(),
          session.tenantId,
          classId,
          studentId,
          date,
          status,
          remarks,
          session.userId
        );
        savedCount++;
      }
      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    return NextResponse.json({ ok: true, savedCount, date, classId });
  } catch (error) {
    console.error("Save attendance error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
