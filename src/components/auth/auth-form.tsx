"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginAction, registerAction } from "@/server/actions/auth";
import { Mark } from "@/components/layout/sidebar";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState<string | null>(null);
  const action = mode === "login" ? loginAction : registerAction;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6">
      <div className="mb-8 flex items-center gap-2">
        <Mark />
        <span className="text-14 font-medium">Noto</span>
      </div>
      <h1 className="text-24">
        {mode === "login" ? "Welcome back" : "Create your workspace"}
      </h1>
      <p className="mt-2 text-13 text-muted">
        {mode === "login"
          ? "Sign in to continue where you left off."
          : "One place for tasks, notes, and dates."}
      </p>
      <form
        className="mt-6 flex flex-col gap-3"
        action={async (formData) => {
          setError(null);
          const result = await action(formData);
          if (result?.error) setError(result.error);
        }}
      >
        {mode === "register" ? (
          <Field label="Name" htmlFor="name">
            <Input id="name" name="name" required autoComplete="name" />
          </Field>
        ) : null}
        <Field label="Email" htmlFor="email">
          <Input id="email" name="email" type="email" required autoComplete="email" />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input
            id="password"
            name="password"
            type="password"
            required
            autoComplete={mode === "login" ? "current-password" : "new-password"}
          />
        </Field>
        {error ? <p className="text-13 text-danger">{error}</p> : null}
        <Button type="submit" className="mt-2">
          {mode === "login" ? "Sign in" : "Create account"}
        </Button>
      </form>
      {mode === "login" ? (
        <p className="mt-4 rounded-[10px] border border-border bg-surface px-3 py-2 text-12 text-muted">
          Demo workspace: <span className="text-text">demo@noto.app</span> /{" "}
          <span className="text-text">noto-demo</span>
        </p>
      ) : null}
      <p className="mt-6 text-13 text-muted">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/register" className="text-text">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have a workspace?{" "}
            <Link href="/login" className="text-text">
              Sign in
            </Link>
          </>
        )}
      </p>
    </div>
  );
}
