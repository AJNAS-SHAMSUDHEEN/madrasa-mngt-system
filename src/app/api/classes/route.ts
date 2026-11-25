import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const classes = db
    .prepare(
      `SELECT c.id, c.name, c.schedule, c.teacher_id, u.name as teacher_name,
              COUNT(sp.id) as student_count
       FROM classes c
       LEFT JOIN users u ON u.id = c.teacher_id
       LEFT JOIN student_profiles sp ON sp.class_id = c.id AND sp.status = 'active'
       WHERE c.tenant_id = ?
       GROUP BY c.id
       ORDER BY c.created_at ASC`
    )
    .all(session.tenantId);

  return NextResponse.json({ classes });
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
    const schedule = String(body.schedule || "").trim();
    const teacherId = body.teacherId ? String(body.teacherId) : session.userId;

    if (!name) {
      return NextResponse.json({ error: "Class name is required." }, { status: 400 });
    }

    const db = getDb();
    const id = crypto.randomUUID();
    db.prepare(
      "INSERT INTO classes (id, tenant_id, name, schedule, teacher_id) VALUES (?, ?, ?, ?, ?)"
    ).run(id, session.tenantId, name, schedule, teacherId);

    return NextResponse.json({ id, name, schedule, teacherId }, { status: 201 });
  } catch (error) {
    console.error("Create class error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
