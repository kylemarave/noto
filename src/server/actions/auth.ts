"use server";

import { hash, compare } from "bcryptjs";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { createSession, destroySession, requireUser } from "@/lib/auth";

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function registerAction(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  if (name.length < 2) return { error: "Enter your name." };
  if (!email.includes("@")) return { error: "Enter a valid email." };
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { error: "An account with that email already exists." };

  const user = await db.user.create({
    data: {
      name,
      email,
      passwordHash: await hash(password, 10),
    },
  });

  await createSession(user.id);
  redirect("/dashboard");
}

export async function loginAction(formData: FormData) {
  const email = normalizeEmail(String(formData.get("email") ?? ""));
  const password = String(formData.get("password") ?? "");

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await compare(password, user.passwordHash))) {
    return { error: "Email or password is incorrect." };
  }

  await createSession(user.id);
  redirect("/dashboard");
}

export async function logoutAction() {
  await destroySession();
  redirect("/login");
}

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Enter your name." };
  await db.user.update({ where: { id: user.id }, data: { name } });
  return { ok: true as const };
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireUser();
  const current = String(formData.get("currentPassword") ?? "");
  const next = String(formData.get("newPassword") ?? "");
  const record = await db.user.findUnique({ where: { id: user.id } });
  if (!record || !(await compare(current, record.passwordHash))) {
    return { error: "Current password is incorrect." };
  }
  if (next.length < 8) return { error: "New password must be at least 8 characters." };
  await db.user.update({
    where: { id: user.id },
    data: { passwordHash: await hash(next, 10) },
  });
  return { ok: true as const };
}
