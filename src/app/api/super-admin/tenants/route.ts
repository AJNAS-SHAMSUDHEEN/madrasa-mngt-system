import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getSession } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getDb();
  const tenants = db
    .prepare(
      `SELECT t.id, t.name, t.slug, t.plan, t.status, t.created_at,
              (SELECT COUNT(*) FROM student_profiles sp WHERE sp.tenant_id = t.id) as student_count,
              (SELECT COUNT(*) FROM users u WHERE u.tenant_id = t.id AND u.role = 'teacher') as teacher_count,
              (SELECT COUNT(*) FROM classes c WHERE c.tenant_id = t.id) as class_count,
              (SELECT COUNT(*) FROM attendance_records ar WHERE ar.tenant_id = t.id) as attendance_count,
              (SELECT u.email FROM users u WHERE u.tenant_id = t.id AND u.role = 'institution_admin' LIMIT 1) as admin_email
       FROM tenants t
       WHERE t.slug != 'attendflow-hq'
       ORDER BY t.created_at DESC`
    )
    .all() as Array<{
    id: string;
    name: string;
    slug: string;
    plan: string;
    status: "active" | "suspended";
    created_at: string;
    student_count: number;
    teacher_count: number;
    class_count: number;
    attendance_count: number;
    admin_email: string | null;
  }>;

  const summary = {
    totalTenants: tenants.length,
    activeTenants: tenants.filter((t) => t.status === "active").length,
    totalStudents: tenants.reduce((sum, t) => sum + Number(t.student_count || 0), 0),
    totalAttendance: tenants.reduce((sum, t) => sum + Number(t.attendance_count || 0), 0),
  };

  return NextResponse.json({ tenants, summary });
}

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.role !== "super_admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const body = await request.json();
    const action = String(body.action || "");
    const db = getDb();

    if (action === "update_tenant") {
      const tenantId = String(body.tenantId || "");
      const plan = ["starter", "pro", "enterprise"].includes(body.plan)
        ? String(body.plan)
        : null;
      const status = ["active", "suspended"].includes(body.status)
        ? String(body.status)
        : null;

      if (!tenantId) {
        return NextResponse.json({ error: "tenantId is required." }, { status: 400 });
      }

      if (plan) {
        db.prepare("UPDATE tenants SET plan = ? WHERE id = ?").run(plan, tenantId);
      }
      if (status) {
        db.prepare("UPDATE tenants SET status = ? WHERE id = ?").run(status, tenantId);
      }
      return NextResponse.json({ ok: true });
    }

    if (action === "create_tenant") {
      const organizationName = String(body.organizationName || "").trim();
      const adminName = String(body.adminName || "").trim();
      const adminEmail = String(body.adminEmail || "").trim().toLowerCase();
      const password = String(body.password || "admin1234");
      const plan = ["starter", "pro", "enterprise"].includes(body.plan)
        ? String(body.plan)
        : "pro";

      if (!organizationName || !adminName || !adminEmail) {
        return NextResponse.json(
          { error: "Institution name, admin name, and admin email are required." },
          { status: 400 }
        );
      }

      const existing = db
        .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
        .get(adminEmail);
      if (existing) {
        return NextResponse.json(
          { error: "A user with this email already exists." },
          { status: 409 }
        );
      }

      const baseSlug = slugify(organizationName) || "academy";
      let slug = baseSlug;
      let suffix = 1;
      while (db.prepare("SELECT id FROM tenants WHERE slug = ?").get(slug)) {
        slug = `${baseSlug}-${suffix++}`;
      }

      const tenantId = crypto.randomUUID();
      const userId = crypto.randomUUID();
      const classId = crypto.randomUUID();
      const hash = bcrypt.hashSync(password, 10);

      db.exec("BEGIN");
      try {
        db.prepare(
          "INSERT INTO tenants (id, name, slug, plan, status) VALUES (?, ?, ?, ?, 'active')"
        ).run(tenantId, organizationName, slug, plan);
        db.prepare(
          "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'institution_admin')"
        ).run(userId, tenantId, adminName, adminEmail, hash);
        db.prepare(
          "INSERT INTO classes (id, tenant_id, name, schedule, teacher_id) VALUES (?, ?, ?, ?, ?)"
        ).run(classId, tenantId, "General Class — Morning", "Mon–Fri • 09:00 AM", userId);
        db.exec("COMMIT");
      } catch (err) {
        db.exec("ROLLBACK");
        throw err;
      }

      return NextResponse.json({ id: tenantId, name: organizationName, slug }, { status: 201 });
    }

    return NextResponse.json({ error: "Unknown action." }, { status: 400 });
  } catch (error) {
    console.error("Super admin error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
