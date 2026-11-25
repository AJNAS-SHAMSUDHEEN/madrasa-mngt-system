import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export type UserRole = "super_admin" | "institution_admin" | "teacher" | "student";

export interface SessionPayload {
  userId: string;
  tenantId: string;
  role: UserRole;
  name: string;
  email: string;
  tenantName: string;
  tenantSlug: string;
  plan: string;
}

const COOKIE_NAME = "madrasa_session";

function getSecretKey() {
  const secret = process.env.JWT_SECRET || "dev-madrasa-saas-secret-change-in-prod";
  return new TextEncoder().encode(secret);
}

export function getRoleDashboardPath(role: UserRole): string {
  switch (role) {
    case "super_admin":
      return "/dashboard/super-admin";
    case "institution_admin":
      return "/dashboard/admin";
    case "teacher":
      return "/dashboard/teacher";
    case "student":
      return "/dashboard/student";
  }
}

export async function createSessionToken(payload: SessionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<SessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return {
      userId: String(payload.userId),
      tenantId: String(payload.tenantId),
      role: payload.role as UserRole,
      name: String(payload.name),
      email: String(payload.email),
      tenantName: String(payload.tenantName),
      tenantSlug: String(payload.tenantSlug),
      plan: String(payload.plan),
    };
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: SessionPayload) {
  const token = await createSessionToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
    secure: process.env.COOKIE_SECURE === "true",
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySessionToken(token);
}
