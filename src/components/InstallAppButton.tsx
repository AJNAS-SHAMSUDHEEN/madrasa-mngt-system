"use client";

import { useEffect, useState } from "react";
import { Download, Share, Smartphone, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

interface InstallAppButtonProps {
  variant?: "primary" | "outline" | "compact" | "dark";
  label?: string;
  className?: string;
}

export default function InstallAppButton({
  variant = "outline",
  label = "Install App",
  className = "",
}: InstallAppButtonProps) {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isIos, setIsIos] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error Safari iOS standalone check
      Boolean(window.navigator.standalone);
    if (standalone) {
      setIsInstalled(true);
      return;
    }

    const ua = window.navigator.userAgent.toLowerCase();
    setIsIos(/iphone|ipad|ipod/.test(ua));

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
    };
  }, []);

  if (isInstalled) return null;

  async function handleClick() {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setDeferredPrompt(null);
      }
      return;
    }
    setShowGuide(true);
  }

  const baseStyles =
    variant === "primary"
      ? "bg-emerald-700 text-white hover:bg-emerald-800 shadow-sm px-5 py-3.5 text-sm rounded-xl"
      : variant === "dark"
      ? "border border-emerald-400/50 bg-emerald-800/50 text-white hover:bg-emerald-800 px-5 py-3.5 text-sm rounded-xl"
      : variant === "compact"
      ? "border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 px-3 py-2 text-xs rounded-xl"
      : "border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 shadow-sm px-5 py-3.5 text-sm rounded-xl";

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center justify-center gap-2 font-semibold transition cursor-pointer ${baseStyles} ${className}`}
      >
        <Download className="h-4 w-4 shrink-0" />
        <span>{label}</span>
      </button>

      {showGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl text-left text-slate-900">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 font-bold text-base">
                <Smartphone className="h-5 w-5 text-emerald-700" />
                Install Madrasa App
              </div>
              <button
                type="button"
                onClick={() => setShowGuide(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {isIos ? (
              <ol className="space-y-2.5 text-sm text-slate-600">
                <li>
                  1. Tap the{" "}
                  <span className="inline-flex items-center gap-1 font-semibold text-slate-900">
                    <Share className="h-3.5 w-3.5" /> Share
                  </span>{" "}
                  button at the bottom of Safari.
                </li>
                <li>
                  2. Scroll down and tap{" "}
                  <strong className="text-slate-900">Add to Home Screen</strong>.
                </li>
                <li>
                  3. Tap <strong className="text-slate-900">Add</strong> to install the app icon.
                </li>
              </ol>
            ) : (
              <div className="space-y-2.5 text-sm text-slate-600">
                <p>
                  You can install this app directly from your browser:
                </p>
                <ul className="space-y-1.5 list-disc pl-4">
                  <li>
                    <strong className="text-slate-900">Chrome / Edge (Desktop):</strong> Click the
                    install icon in the right side of the address bar, or open the browser menu
                    (⋮) → <strong className="text-slate-900">Install Madrasa Management</strong>.
                  </li>
                  <li>
                    <strong className="text-slate-900">Android Chrome:</strong> Tap the menu (⋮) →{" "}
                    <strong className="text-slate-900">Install app</strong> or{" "}
                    <strong className="text-slate-900">Add to Home screen</strong>.
                  </li>
                </ul>
              </div>
            )}

            <button
              type="button"
              onClick={() => setShowGuide(false)}
              className="mt-5 w-full rounded-xl bg-emerald-700 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
