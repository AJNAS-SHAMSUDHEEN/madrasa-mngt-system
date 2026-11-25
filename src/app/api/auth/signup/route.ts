import { NextResponse } from "next/server";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const organizationName = String(body.organizationName || "").trim();
    const name = String(body.name || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");
    const plan = ["starter", "pro", "enterprise"].includes(body.plan)
      ? String(body.plan)
      : "starter";

    if (!organizationName || !name || !email || password.length < 6) {
      return NextResponse.json(
        {
          error:
            "Institution name, your name, valid email, and password (min 6 chars) are required.",
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const existingUser = db
      .prepare("SELECT id FROM users WHERE LOWER(email) = ?")
      .get(email);
    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists." },
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
    const defaultClassId = crypto.randomUUID();
    const passwordHash = bcrypt.hashSync(password, 10);

    db.exec("BEGIN");
    try {
      db.prepare(
        "INSERT INTO tenants (id, name, slug, plan, status) VALUES (?, ?, ?, ?, 'active')"
      ).run(tenantId, organizationName, slug, plan);

      db.prepare(
        "INSERT INTO users (id, tenant_id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?, 'institution_admin')"
      ).run(userId, tenantId, name, email, passwordHash);

      db.prepare(
        "INSERT INTO classes (id, tenant_id, name, schedule, teacher_id) VALUES (?, ?, ?, ?, ?)"
      ).run(defaultClassId, tenantId, "General Class — Morning", "Mon–Fri • 09:00 AM", userId);

      db.exec("COMMIT");
    } catch (err) {
      db.exec("ROLLBACK");
      throw err;
    }

    await setSessionCookie({
      userId,
      tenantId,
      role: "institution_admin",
      name,
      email,
      tenantName: organizationName,
      tenantSlug: slug,
      plan,
    });

    return NextResponse.json(
      {
        redirectTo: "/dashboard/admin",
        tenant: { id: tenantId, name: organizationName, slug, plan },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
