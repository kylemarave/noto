"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  logoutAction,
  updatePasswordAction,
  updateProfileAction,
} from "@/server/actions/auth";
import type { WorkspaceUser } from "@/server/queries";
import { Section } from "@/components/layout/page";

const THEMES = [
  { id: "dark", label: "Dark" },
  { id: "light", label: "Light" },
] as const;

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
    <div className="flex w-full max-w-xl flex-col gap-8">
      <Section title="Appearance">
        <div className="flex w-fit gap-0.5 rounded-md bg-fill p-0.5">
          {THEMES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => applyTheme(item.id)}
              aria-pressed={theme === item.id}
              className={cn(
                "h-9 cursor-pointer rounded-sm px-4 text-13 font-medium transition-colors",
                theme === item.id ? "inverse" : "text-muted hover:text-text",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </Section>

      <Section title="Profile">
        <form
          className="flex flex-col gap-3"
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
      </Section>

      <Section title="Password">
        <form
          className="flex flex-col gap-3"
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
      </Section>

      <form action={logoutAction} className="border-t border-border pt-6">
        <Button variant="ghost" size="sm" type="submit">
          Sign out
        </Button>
      </form>
    </div>
  );
}

