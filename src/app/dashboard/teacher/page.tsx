"use client";

import AuthGuard from "@/components/AuthGuard";
import TeacherAttendanceClient from "@/components/TeacherAttendanceClient";

export default function TeacherDashboardPage() {
  return (
    <AuthGuard allowedRoles={["teacher", "institution_admin"]}>
      {(session) => (
        <TeacherAttendanceClient
          tenantId={session.tenant.id}
          userId={session.user.uid}
          userName={session.user.name}
        />
      )}
    </AuthGuard>
  );
}
