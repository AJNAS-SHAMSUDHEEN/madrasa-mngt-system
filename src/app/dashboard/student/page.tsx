"use client";

import AuthGuard from "@/components/AuthGuard";
import StudentPortalClient from "@/components/StudentPortalClient";

export default function StudentDashboardPage() {
  return (
    <AuthGuard allowedRoles={["student"]}>
      {(session) => (
        <StudentPortalClient tenantId={session.tenant.id} uid={session.user.uid} />
      )}
    </AuthGuard>
  );
}
