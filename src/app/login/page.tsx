"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { ClipboardCheck, Loader2 } from "lucide-react";
import { firebaseAuth } from "@/lib/firebase";
import {
  getRoleDashboardPath,
  loadSessionForUid,
  signInWithFirebase,
} from "@/lib/firestore-service";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(firebaseAuth, async (user) => {
      if (!user) {
        setCheckingSession(false);
        return;
      }
      try {
        const session = await loadSessionForUid(user.uid);
        if (session && (session.user.role === "super_admin" || session.tenant.status !== "suspended")) {
          router.replace(getRoleDashboardPath(session.user.role));
          return;
        }
      } catch {
        // Fall back to login form
      }
      setCheckingSession(false);
    });
    return () => unsub();
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { redirectTo } = await signInWithFirebase(email, password);
      router.replace(redirectTo);
      router.refresh();
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Invalid email or password.";
      setError(msg);
      setLoading(false);
    }
  }

  if (checkingSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-sm text-slate-600 gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-emerald-700" />
        Opening your Madrasa workspace...
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 font-bold text-xl text-slate-900">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-700 text-white shadow-sm">
              <ClipboardCheck className="h-5 w-5" />
            </span>
            Madrasa Management
          </Link>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Sign in to your workspace</h1>
          <p className="mt-1 text-sm text-slate-600">
            You will stay signed in until you choose to log out.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
        >
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@academy.edu"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-300 px-3.5 py-2.5 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-800 disabled:opacity-60 transition cursor-pointer"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Sign in
          </button>

          <p className="text-center text-xs text-slate-500 pt-1">
            New institution?{" "}
            <Link href="/signup" className="font-semibold text-emerald-700 hover:underline">
              Create a Madrasa workspace
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
