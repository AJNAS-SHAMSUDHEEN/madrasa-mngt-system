"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebase";
import { getRoleDashboardPath, loadSessionForUid } from "@/lib/firestore-service";

export default function AppLaunchRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error Safari iOS standalone check
      Boolean(window.navigator.standalone);

    if (!isStandalone) return;

    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        router.replace("/login");
        return;
      }
      const session = await loadSessionForUid(user.uid);
      if (session) {
        router.replace(getRoleDashboardPath(session.user.role));
      } else {
        router.replace("/login");
      }
    });

    return () => unsub();
  }, [router]);

  return null;
}
