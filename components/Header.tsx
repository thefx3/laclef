"use client";

import Link from "next/link";
import { APPS } from "@/lib/apps";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";

export default function Header() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const [email, setEmail] = useState<string | null>(null);

  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      const { data } = await supabase.auth.getUser();
      const user = data.user;
      setEmail(user?.email ?? null);

      if (!user) return;

      const { data: profile, error } = await supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", user.id)
        .single();

        console.log("profile", profile, "error", error);

      if (!mounted) return;

      if (error) {
        console.warn("Failed to load role", error);
      } else {
        setRole(profile?.role ?? null);
      }
    }

    load();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setEmail(session?.user?.email ?? null);

      if (session?.user) {
        const { data: profile, error } = await supabase
          .from("user_profiles")
          .select("role")
          .eq("user_id", session.user.id)
          .single();

        if (!mounted) return;
        if (error) {
          console.warn("Failed to load role", error);
          setRole(null);
        } else {
          setRole(profile?.role ?? null);
        }
      } else {
        setRole(null);
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [supabase]);


  async function logout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const iconClass =
    "h-10 w-10 border border-black p-2 rounded-md transition-transform cursor-pointer hover:scale-95 hover:bg-black hover:text-white";

  return (
    <header className="flex w-full items-center justify-between bg-white border-b px-4 py-4 shadow-sm">
      <div className="flex items-center gap-4 ml-4">
        {APPS.map(({ href, label, Icon, colorClass }) => (
          <Link
            key={href}
            href={href}
            aria-label={label}
            title={label}
            className="inline-flex"
          >
            <Icon className={`${iconClass} ${colorClass}`} />
          </Link>
        ))}
      </div>

      <div className="flex text-sm text-black gap-2 items-center">
        {email ? (
         <div className="text-sm text-gray-700">
         Connecté : <span className="font-medium">{email ?? "—"}</span>
         {role && <span className="ml-2 px-2 py-0.5 text-xs">{role}</span>}
         </div>
        ) : (
          <span className="text-gray-400">Non connecté</span>
        )}

      <button
        onClick={logout}
        className="rounded-md border px-3 py-2 text-sm hover:bg-gray-100 cursor-pointer transition"
      >
        Déconnexion
      </button>
      </div>



      {/* <AuthStatus /> */}
    </header>
  );
}
