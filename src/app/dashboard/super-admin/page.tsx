"use client";

import AuthGuard from "@/components/AuthGuard";
import SuperAdminClient from "@/components/SuperAdminClient";

export default function SuperAdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["super_admin"]}>
      {() => <SuperAdminClient />}
    </AuthGuard>
  );
}
