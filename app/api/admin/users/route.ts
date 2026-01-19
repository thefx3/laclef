import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

async function requireRoles(req: Request, allowedRoles: string[]) {
  const auth = req.headers.get("authorization");
  if (!auth?.startsWith("Bearer ")) {
    return { error: "Missing token", status: 401 } as const;
  }
  const token = auth.replace("Bearer ", "");
  const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
  if (userErr || !userData.user) {
    return { error: "Invalid token", status: 401 } as const;
  }

  const { data: profile, error: profileErr } = await supabaseAdmin
    .from("user_profiles")
    .select("role")
    .eq("user_id", userData.user.id)
    .single();

  if (profileErr) {
    return { error: profileErr.message, status: 403 } as const;
  }
  if (!profile) {
    return { error: "Profile not found", status: 403 } as const;
  }

  if (!allowedRoles.includes(profile.role)) {
    return { error: "Forbidden", status: 403 } as const;
  }

  return { user: userData.user } as const;
}

export async function POST(req: Request) {
  const auth = await requireRoles(req, ["ACCUEIL", "ADMIN", "SUPER_ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const email = String(body.email ?? "").trim();
  const password = String(body.password ?? "");
  const firstName = String(body.first_name ?? "").trim();
  const lastName = String(body.last_name ?? "").trim();
  const role = String(body.role ?? "USER");

  if (!email || !password) {
    return NextResponse.json({ error: "Missing email or password" }, { status: 400 });
  }

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (error || !data.user) {
    return NextResponse.json({ error: error?.message ?? "Create failed" }, { status: 400 });
  }

  await supabaseAdmin
    .from("user_profiles")
    .update({
      email,
      role,
      first_name: firstName || null,
      last_name: lastName || null,
    })
    .eq("user_id", data.user.id);

  return NextResponse.json({ user_id: data.user.id }, { status: 201 });
}

export async function PATCH(req: Request) {
  const auth = await requireRoles(req, ["ADMIN", "SUPER_ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const userId = String(body.user_id ?? "").trim();
  const role = "role" in body ? String(body.role ?? "").trim() : "";
  const email = "email" in body ? String(body.email ?? "").trim() : "";
  const firstName = "first_name" in body ? String(body.first_name ?? "").trim() : "";
  const lastName = "last_name" in body ? String(body.last_name ?? "").trim() : "";
  const password = "password" in body ? String(body.password ?? "") : "";
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }
  if (!role && !email && !firstName && !lastName && !password) {
    return NextResponse.json(
      { error: "Missing role, email, first_name, last_name, or password" },
      { status: 400 }
    );
  }
  if ("email" in body && !email) {
    return NextResponse.json({ error: "Missing email" }, { status: 400 });
  }
  if ("password" in body && !password) {
    return NextResponse.json({ error: "Missing password" }, { status: 400 });
  }

  if (email) {
    const { error: emailError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { email }
    );
    if (emailError) {
      return NextResponse.json({ error: emailError.message }, { status: 400 });
    }
  }
  if (password) {
    const { error: passwordError } = await supabaseAdmin.auth.admin.updateUserById(
      userId,
      { password }
    );
    if (passwordError) {
      return NextResponse.json({ error: passwordError.message }, { status: 400 });
    }
  }

  const profileUpdates: Record<string, string | null> = {};
  if (role) profileUpdates.role = role;
  if ("email" in body) profileUpdates.email = email || null;
  if ("first_name" in body) profileUpdates.first_name = firstName || null;
  if ("last_name" in body) profileUpdates.last_name = lastName || null;

  const { error } = await supabaseAdmin
    .from("user_profiles")
    .update(profileUpdates)
    .eq("user_id", userId);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const auth = await requireRoles(req, ["ADMIN", "SUPER_ADMIN"]);
  if ("error" in auth) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body = await req.json();
  const userId = String(body.user_id ?? "").trim();
  if (!userId) {
    return NextResponse.json({ error: "Missing user_id" }, { status: 400 });
  }

  const { error } = await supabaseAdmin.auth.admin.deleteUser(userId);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
