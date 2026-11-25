"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { Loader2 } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import {
  ActiveSession,
  getRoleDashboardPath,
  loadSessionForUid,
  UserRole,
} from "@/lib/firestore-service";
import DashboardShell from "@/components/DashboardShell";

interface AuthGuardProps {
  allowedRoles: UserRole[];
  children: (session: ActiveSession) => React.ReactNode;
}

export default function AuthGuard({ allowedRoles, children }: AuthGuardProps) {
  const router = useRouter();
  const [session, setSession] = useState<ActiveSession | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (fbUser) => {
      if (!fbUser) {
        router.replace("/login");
        setChecking(false);
        return;
      }

      try {
        const loaded = await loadSessionForUid(fbUser.uid);
        if (!loaded) {
          router.replace("/login");
          setChecking(false);
          return;
        }
        if (loaded.user.role !== "super_admin" && loaded.tenant.status === "suspended") {
          router.replace("/login");
          setChecking(false);
          return;
        }
        if (!allowedRoles.includes(loaded.user.role)) {
          router.replace(getRoleDashboardPath(loaded.user.role));
          setChecking(false);
          return;
        }
        setSession(loaded);
      } catch {
        router.replace("/login");
      } finally {
        setChecking(false);
      }
    });

    return () => unsub();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (checking || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-500 gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        Connecting to Firebase workspace...
      </div>
    );
  }

  return (
    <DashboardShell
      userName={session.user.name}
      userRole={session.user.role}
      tenantName={session.tenant.name}
      plan={session.tenant.plan}
    >
      {children(session)}
    </DashboardShell>
  );
}
