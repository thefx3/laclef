"use client";

import { useEffect, useMemo, useState } from "react";
import PageShell from "@/components/page_layout/PageShell";
import PageHeader from "@/components/page_layout/PageHeader";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { Modal } from "@/components/accueil/calendar/Modal";
import { cn } from "@/components/accueil/posts/cn";
import type { Session } from "@supabase/supabase-js";


type UserProfileRow = {
    user_id: string;
    email: string | null;
    first_name: string | null;
    last_name: string | null;
    role: "USER" | "MUSIQUE" | "ACTIVITES" | "FLCE" | "ACCUEIL" | "ADMIN" | "SUPER_ADMIN";
    created_at: string;
  };

  
export default function UsersPage() {
    const supabase = useMemo(() => createSupabaseBrowserClient(), []);
    const [session, setSession] = useState<Session | null>(null);
    const isGuest = !session?.user;
    const [users, setUsers] = useState<UserProfileRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentRole, setCurrentRole] = useState<UserProfileRow["role"] | null>(null);
    const [newEmail, setNewEmail] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [newFirstName, setNewFirstName] = useState("");
    const [newLastName, setNewLastName] = useState("");
    const [newRole, setNewRole] = useState<UserProfileRow["role"]>("USER");
    const [editingUser, setEditingUser] = useState<UserProfileRow | null>(null);
    const [editingRole, setEditingRole] = useState<UserProfileRow["role"]>("USER");
    const [editingEmail, setEditingEmail] = useState("");
    const [editingFirstName, setEditingFirstName] = useState("");
    const [editingLastName, setEditingLastName] = useState("");
    const [editingPassword, setEditingPassword] = useState("");
    const [selfPassword, setSelfPassword] = useState("");
    const [selfPasswordSuccess, setSelfPasswordSuccess] = useState<string | null>(null);

    useEffect(() => {
      supabase.auth.getSession().then(({ data }) => setSession(data.session));
      const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
        setSession(nextSession);
      });
      return () => {
        sub.subscription.unsubscribe();
      };
    }, [supabase]);

    async function loadUsers(active: { value: boolean }) {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("user_id,email,first_name,last_name,role,created_at")
        .order("created_at", { ascending: false });
  
      if (!active.value) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setUsers((data as UserProfileRow[]) ?? []);
      setLoading(false);
    }
  
    useEffect(() => {
      const active = { value: true };
      setLoading(true);
      setError(null);
      void loadUsers(active);
  
      return () => {
        active.value = false;
      };
    }, []);
  
    useEffect(() => {
      if (!session) return;
      supabase
        .from("user_profiles")
        .select("role")
        .eq("user_id", session.user.id)
        .single()
        .then(({ data }) => {
          if (data?.role) setCurrentRole(data.role);
        });
    }, [session, supabase]);
  
    async function callAdminApi(
      method: "POST" | "PATCH" | "DELETE",
      body: Record<string, unknown>
    ) {
      if (!session) return;
      const { data } = await supabase.auth.getSession();
      const token = data.session?.access_token;
      if (!token) return;
  
      const res = await fetch("/api/admin/users", {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
  
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Erreur serveur");
      }
    }
  
    const isAdmin = currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";
    const canCreateUser =
      currentRole === "ACCUEIL" || currentRole === "ADMIN" || currentRole === "SUPER_ADMIN";
    const isSuperAdmin = currentRole === "SUPER_ADMIN";

    return (
        <PageShell>
            <PageHeader title="Utilisateurs" />
            {isGuest && (
        <p className="text-sm text-amber-700">
          Mode invité : création/modification d&apos;utilisateurs désactivée.
        </p>
      )}

      {canCreateUser && (
        <section className="w-full rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Créer un compte
          </h2>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
            />
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Mot de passe"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              type="password"
            />
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Prénom"
              value={newFirstName}
              onChange={(e) => setNewFirstName(e.target.value)}
            />
            <input
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nom"
              value={newLastName}
              onChange={(e) => setNewLastName(e.target.value)}
            />
            <select
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as UserProfileRow["role"])}
            >
              <option value="MUSIQUE">MUSIQUE</option>
              <option value="ACTIVITES">ACTIVITES</option>
              <option value="FLCE">FLCE</option>
              <option value="ACCUEIL">ACCUEIL</option>
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
              <option value="SUPER_ADMIN">SUPER_ADMIN</option>
            </select>
          </div>
          <button
            className={cn("btn-primary", "mt-3")}
            onClick={async () => {
              try {
                await callAdminApi("POST", {
                  email: newEmail,
                  password: newPassword,
                  first_name: newFirstName,
                  last_name: newLastName,
                  role: newRole,
                });
                setNewEmail("");
                setNewPassword("");
                setNewFirstName("");
                setNewLastName("");
                setNewRole("USER");
                setLoading(true);
                await loadUsers({ value: true });
              } catch (err) {
                setError((err as Error).message);
              }
            }}
          >
            Créer
          </button>
        </section>
      )}

      {loading && <p className="text-sm text-gray-500">Chargement...</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      {!isGuest && (
        <section className="w-full rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-3">
            Changer mon mot de passe
          </h2>
          {selfPasswordSuccess && (
            <p className="text-sm text-green-600">{selfPasswordSuccess}</p>
          )}
          <div className="flex flex-col gap-3 md:flex-row">
            <input
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm"
              placeholder="Nouveau mot de passe"
              type="password"
              value={selfPassword}
              onChange={(e) => setSelfPassword(e.target.value)}
            />
            <button
              className="btn-primary"
              onClick={async () => {
                try {
                  if (!selfPassword) {
                    throw new Error("Mot de passe manquant");
                  }
                  const { error } = await supabase.auth.updateUser({
                    password: selfPassword,
                  });
                  if (error) throw error;
                  setSelfPassword("");
                  setSelfPasswordSuccess("Mot de passe mis à jour.");
                  setError(null);
                } catch (err) {
                  setError((err as Error).message);
                }
              }}
            >
              Enregistrer
            </button>
          </div>
        </section>
      )}

      {!loading && !error && (
        <div className="w-full overflow-x-auto rounded-xl border border-gray-200">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Prénom</th>
                <th className="px-4 py-3 text-left">Nom</th>
                <th className="px-4 py-3 text-left">Rôle</th>
                <th className="px-4 py-3 text-left">Créé le</th>
                {isAdmin && <th className="px-4 py-3 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.user_id} className="text-gray-800">
                  <td className="px-4 py-3">{user.email ?? "—"}</td>
                  <td className="px-4 py-3">{user.first_name ?? "—"}</td>
                  <td className="px-4 py-3">{user.last_name ?? "—"}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-semibold text-gray-600">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {new Date(user.created_at).toLocaleDateString("fr-FR")}
                  </td>
                  {isAdmin && (
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-3">
                        <button
                          className={cn(
                            "btn-action",
                            "btn-action--edit",
                            "btn-action--disabled"
                          )}
                          disabled={!isSuperAdmin && user.role === "SUPER_ADMIN"}
                          onClick={() => {
                            setEditingUser(user);
                            setEditingRole(user.role);
                            setEditingEmail(user.email ?? "");
                            setEditingFirstName(user.first_name ?? "");
                            setEditingLastName(user.last_name ?? "");
                            setEditingPassword("");
                          }}
                        >
                          Modifier
                        </button>
                        <button
                          className={cn(
                            "btn-action",
                            "btn-action--delete",
                            "btn-action--disabled"
                          )}
                          disabled={!isSuperAdmin && user.role === "SUPER_ADMIN"}
                          onClick={async () => {
                            try {
                              await callAdminApi("DELETE", { user_id: user.user_id });
                              setUsers((prev) =>
                                prev.filter((u) => u.user_id !== user.user_id)
                              );
                            } catch (err) {
                              setError((err as Error).message);
                            }
                          }}
                        >
                          Supprimer
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td
                    className="px-4 py-6 text-center text-gray-500"
                    colSpan={isAdmin ? 6 : 5}
                  >
                    Aucun utilisateur trouvé.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {editingUser && (
        <Modal
          onClose={() => {
            setEditingUser(null);
          }}
        >
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-500">Utilisateur</p>
              <p className="text-sm font-semibold text-gray-900">
                {editingUser.email ?? "—"}
              </p>
            </div>
            <label className="block text-sm font-semibold text-gray-900">
              Email
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={editingEmail}
                onChange={(e) => setEditingEmail(e.target.value)}
                type="email"
              />
            </label>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="block text-sm font-semibold text-gray-900">
                Prénom
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingFirstName}
                  onChange={(e) => setEditingFirstName(e.target.value)}
                />
              </label>
              <label className="block text-sm font-semibold text-gray-900">
                Nom
                <input
                  className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                  value={editingLastName}
                  onChange={(e) => setEditingLastName(e.target.value)}
                />
              </label>
            </div>
            <label className="block text-sm font-semibold text-gray-900">
              Mot de passe (optionnel)
              <input
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={editingPassword}
                onChange={(e) => setEditingPassword(e.target.value)}
                type="password"
              />
            </label>
            <label className="block text-sm font-semibold text-gray-900">
              Rôle
              <select
                className="mt-2 w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                value={editingRole}
                onChange={(e) =>
                  setEditingRole(e.target.value as UserProfileRow["role"])
                }
              >
                <option value="MUSIQUE">MUSIQUE</option>
                <option value="ACTIVITES">ACTIVITES</option>
                <option value="FLCE">FLCE</option>
                <option value="ACCUEIL">ACCUEIL</option>
                <option value="USER">USER</option>
                <option value="ADMIN">ADMIN</option>
                {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN</option>}
              </select>
            </label>
            <div className="flex items-center justify-end gap-3">
              <button
                className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
                onClick={() => setEditingUser(null)}
                type="button"
              >
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={async () => {
                  try {
                    const payload: Record<string, unknown> = {
                      user_id: editingUser.user_id,
                      email: editingEmail,
                      first_name: editingFirstName,
                      last_name: editingLastName,
                      role: editingRole,
                    };
                    if (editingPassword) {
                      payload.password = editingPassword;
                    }
                    await callAdminApi("PATCH", payload);
                    setUsers((prev) =>
                      prev.map((u) =>
                        u.user_id === editingUser.user_id
                          ? {
                              ...u,
                              email: editingEmail || null,
                              first_name: editingFirstName || null,
                              last_name: editingLastName || null,
                              role: editingRole,
                            }
                          : u
                      )
                    );
                    setEditingUser(null);
                  } catch (err) {
                    setError((err as Error).message);
                  }
                }}
                type="button"
              >
                Enregistrer
              </button>
            </div>
          </div>
        </Modal>
      )}
        </PageShell>
    )
}
