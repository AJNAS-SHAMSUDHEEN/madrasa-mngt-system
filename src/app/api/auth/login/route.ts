import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "@/lib/db";
import { getRoleDashboardPath, setSessionCookie, UserRole } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required." },
        { status: 400 }
      );
    }

    const db = getDb();
    const user = db
      .prepare(
        `SELECT u.id, u.tenant_id, u.name, u.email, u.password_hash, u.role,
                t.name as tenant_name, t.slug as tenant_slug, t.plan as plan, t.status as tenant_status
         FROM users u
         JOIN tenants t ON t.id = u.tenant_id
         WHERE LOWER(u.email) = ?`
      )
      .get(email) as
      | {
          id: string;
          tenant_id: string;
          name: string;
          email: string;
          password_hash: string;
          role: UserRole;
          tenant_name: string;
          tenant_slug: string;
          plan: string;
          tenant_status: string;
        }
      | undefined;

    if (!user || !bcrypt.compareSync(password, user.password_hash)) {
      return NextResponse.json(
        { error: "Invalid email or password." },
        { status: 401 }
      );
    }

    if (user.role !== "super_admin" && user.tenant_status === "suspended") {
      return NextResponse.json(
        { error: "This institution workspace is currently suspended. Contact platform support." },
        { status: 403 }
      );
    }

    await setSessionCookie({
      userId: user.id,
      tenantId: user.tenant_id,
      role: user.role,
      name: user.name,
      email: user.email,
      tenantName: user.tenant_name,
      tenantSlug: user.tenant_slug,
      plan: user.plan,
    });

    const redirectTo = getRoleDashboardPath(user.role);

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        tenantName: user.tenant_name,
        plan: user.plan,
      },
      redirectTo,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
