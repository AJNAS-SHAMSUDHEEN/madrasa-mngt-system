"use client";

import AuthGuard from "@/components/AuthGuard";
import AdminOverviewClient from "@/components/AdminOverviewClient";

export default function AdminDashboardPage() {
  return (
    <AuthGuard allowedRoles={["institution_admin"]}>
      {(session) => <AdminOverviewClient tenantId={session.tenant.id} />}
    </AuthGuard>
  );
}
