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

    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      if (!data.session) {
        setStatus("unauthenticated");
        return;
      }
      setStatus("ready");
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!active) return;
      if (!session) {
        setStatus("unauthenticated");
        return;
      }
      setStatus("ready");
    });

    return () => {
      active = false;
      listener.subscription.unsubscribe();
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
