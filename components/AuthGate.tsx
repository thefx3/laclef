"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import LoginForm from "@/components/LoginForm";

type Props = {
  children: ReactNode;
};

export default function AuthGate({ children }: Props) {
  const pathname = usePathname();
  const [status, setStatus] = useState<"loading" | "ready" | "unauthenticated">(
    "loading"
  );

  useEffect(() => {
    let active = true;

    const safeSetStatus = (next: "loading" | "ready" | "unauthenticated") => {
      if (!active) return;
      setStatus(next);
    };

    const withTimeout = <T,>(promise: Promise<T>, ms: number) =>
      new Promise<T>((resolve, reject) => {
        const timer = setTimeout(() => {
          clearTimeout(timer);
          reject(new Error("timeout"));
        }, ms);
        promise.then(
          (value) => {
            clearTimeout(timer);
            resolve(value);
          },
          (err) => {
            clearTimeout(timer);
            reject(err);
          }
        );
      });

    const checkSession = async (showLoading: boolean) => {
      if (showLoading) safeSetStatus("loading");
      try {
        const { data: sessionData, error: sessionError } = await withTimeout(
          supabase.auth.getSession(),
          8000
        );
        if (sessionError || !sessionData.session) {
          safeSetStatus("unauthenticated");
          return;
        }

        const { data: userData, error: userError } = await withTimeout(
          supabase.auth.getUser(),
          8000
        );
        if (userError || !userData.user) {
          safeSetStatus("unauthenticated");
          return;
        }

        safeSetStatus("ready");
      } catch (_err) {
        safeSetStatus("unauthenticated");
      }
    };

    void checkSession(true);

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        safeSetStatus("unauthenticated");
        return;
      }
      safeSetStatus("ready");
    });

    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        void checkSession(false);
      }
    };
    const handleFocus = () => {
      void checkSession(false);
    };
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("focus", handleFocus);

    return () => {
      active = false;
      listener.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("focus", handleFocus);
    };
  }, [supabase]);

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-gray-500">
        Chargement...
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen grid place-items-center bg-gray-50 p-6">
        <LoginForm redirectTo={pathname || "/"} />
      </div>
    );
  }

  return <>{children}</>;
}
