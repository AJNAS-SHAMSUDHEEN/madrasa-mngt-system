"use client";

import AuthGuard from "@/components/AuthGuard";
import StudentProfilesClient from "@/components/StudentProfilesClient";

export default function TeacherStudentsPage() {
  return (
    <AuthGuard allowedRoles={["teacher", "institution_admin"]}>
      {(session) => <StudentProfilesClient tenantId={session.tenant.id} />}
    </AuthGuard>
  );
}
