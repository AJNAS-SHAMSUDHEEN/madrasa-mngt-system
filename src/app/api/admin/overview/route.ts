import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "institution_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  const tenant = db
    .prepare("SELECT id, name, slug, plan, created_at FROM tenants WHERE id = ?")
    .get(session.tenantId);

  const teachers = db
    .prepare(
      `SELECT u.id, u.name, u.email, u.created_at, COUNT(c.id) as class_count
       FROM users u
       LEFT JOIN classes c ON c.teacher_id = u.id
       WHERE u.tenant_id = ? AND u.role = 'teacher'
       GROUP BY u.id
       ORDER BY u.created_at DESC`
    )
    .all(session.tenantId);

  const stats = db
    .prepare(
      `SELECT
         (SELECT COUNT(*) FROM student_profiles WHERE tenant_id = ? AND status = 'active') as total_students,
         (SELECT COUNT(*) FROM users WHERE tenant_id = ? AND role = 'teacher') as total_teachers,
         (SELECT COUNT(*) FROM classes WHERE tenant_id = ?) as total_classes,
         (SELECT COUNT(*) FROM attendance_records WHERE tenant_id = ?) as total_records,
         (SELECT COUNT(*) FROM attendance_records WHERE tenant_id = ? AND status IN ('present', 'late')) as attended_records`
    )
    .get(
      session.tenantId,
      session.tenantId,
      session.tenantId,
      session.tenantId,
      session.tenantId
    ) as {
    total_students: number;
    total_teachers: number;
    total_classes: number;
    total_records: number;
    attended_records: number;
  };

  const today = new Date().toISOString().slice(0, 10);
  const todayBreakdown = db
    .prepare(
      `SELECT status, COUNT(*) as count
       FROM attendance_records
       WHERE tenant_id = ? AND date = ?
       GROUP BY status`
    )
    .all(session.tenantId, today);

  return NextResponse.json({ tenant, teachers, stats, todayBreakdown });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "institution_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const db = getDb();

    if (action === "create_teacher") {
      const name = String(body.name || "").trim();
      const email = String(body.email || "").trim().toLowerCase();
      const password = String(body.password || "teacher123");

      if (!name || !email) {
        return NextResponse.json(
          { error: "Teacher name and email are required." },
          { status: 400 }
        );
      }

      const existing = db
        .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
        .get(email);
      if (existing) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 409 }
        );
      }

      const id = crypto.randomUUID();
      const hash = bcrypt.hashSync(password, 10);
      db.prepare(
        "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'teacher')"
      ).run(id, session.tenantId, name, email, hash);

      return NextResponse.json({ id, name, email }, { status: 201 });
    }

    if (action === "update_plan") {
      const plan = ["starter", "pro", "enterprise"].includes(body.plan)
        ? String(body.plan)
        : null;
      if (!plan) {
        return NextResponse.json({ error: "Invalid plan." }, { status: 400 });
      }
      db.prepare("UPDATE tenants SET plan = ? WHERE id = ?").run(
        plan,
        session.tenantId
      );
      return NextResponse.json({ ok: true, plan });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("Admin action error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
