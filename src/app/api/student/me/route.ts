import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getDb();
  const profile = db
    .prepare(
      `SELECT sp.id, sp.user_id, sp.class_id, sp.roll_number, sp.guardian_name,
              sp.guardian_phone, sp.date_of_birth, sp.address, sp.enrollment_date,
              sp.notes, sp.status,
              u.name, u.email,
              c.name as class_name, c.schedule as class_schedule,
              t.name as teacher_name
       FROM student_profiles sp
       JOIN users u ON u.id = sp.user_id
       LEFT JOIN classes c ON c.id = sp.class_id
       LEFT JOIN users t ON t.id = c.teacher_id
       WHERE sp.user_id = ? AND sp.tenant_id = ?`
    )
    .get(session.userId, session.tenantId) as { id: string } | undefined;

  if (!profile) {
    return NextResponse.json(
      { error: "Student profile not found for this account." },
      { status: 404 }
    );
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
       LIMIT 120`
    )
    .all(profile.id, session.tenantId) as Array<{
    id: string;
    date: string;
    status: "present" | "absent" | "late" | "excused";
    remarks: string;
    updated_at: string;
    class_name: string;
    marked_by_name: string;
  }>;

  const summary = {
    total: records.length,
    present: records.filter((r) => r.status === "present").length,
    late: records.filter((r) => r.status === "late").length,
    absent: records.filter((r) => r.status === "absent").length,
    excused: records.filter((r) => r.status === "excused").length,
    attendanceRate:
      records.length > 0
        ? Math.round(
            (records.filter((r) => r.status === "present" || r.status === "late")
              .length /
              records.length) *
              100
          )
        : 100,
  };

  return NextResponse.json({ profile, summary, records });
}
