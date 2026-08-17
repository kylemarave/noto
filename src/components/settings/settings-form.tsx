"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  logoutAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/server/actions/auth";
import type { WorkspaceUser } from "@/server/queries";

export function SettingsForm({ user }: { user: WorkspaceUser }) {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem("noto-theme");
    if (stored === "light" || stored === "dark") setTheme(stored);
  }, []);

  function applyTheme(next: "dark" | "light") {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("noto-theme", next);
  }

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8">
      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-medium">Profile</h2>
        <form
          className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4"
          action={async (formData) => {
            const result = await updateProfileAction(formData);
            if (result && "error" in result) toast.error(result.error);
            else toast.success("Profile updated");
          }}
        >
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" defaultValue={user.name} />
          </Field>
          <Field label="Email">
            <Input value={user.email} disabled />
          </Field>
          <Button type="submit" className="self-start">
            Save name
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-medium">Password</h2>
        <form
          className="flex flex-col gap-3 rounded-[10px] border border-border bg-surface p-4"
          action={async (formData) => {
            const result = await updatePasswordAction(formData);
            if (result && "error" in result) toast.error(result.error);
            else toast.success("Password updated");
          }}
        >
          <Field label="Current password" htmlFor="currentPassword">
            <Input id="currentPassword" name="currentPassword" type="password" />
          </Field>
          <Field label="New password" htmlFor="newPassword">
            <Input id="newPassword" name="newPassword" type="password" />
          </Field>
          <Button type="submit" className="self-start">
            Update password
          </Button>
        </form>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-14 font-medium">Appearance</h2>
        <div className="flex gap-2 rounded-[10px] border border-border bg-surface p-4">
          <Button
            variant={theme === "dark" ? "primary" : "outline"}
            onClick={() => applyTheme("dark")}
          >
            Dark
          </Button>
          <Button
            variant={theme === "light" ? "primary" : "outline"}
            onClick={() => applyTheme("light")}
          >
            Light
          </Button>
        </div>
      </section>

      <form action={logoutAction}>
        <Button variant="outline" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}
