import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Page({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full flex-col gap-8", className)}>{children}</div>
  );
}

export function PageFill({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col", className)}>{children}</div>
  );
}

export function Toolbar({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {children}
    </div>
  );
}

export function Section({
  title,
  action,
  tone = "default",
  children,
}: {
  title: string;
  action?: { href: string; label: string };
  tone?: "default" | "emphasis" | "alert";
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4">
        <h3
          className={cn(
            "text-13 font-medium",
            tone === "alert"
              ? "text-danger"
              : tone === "emphasis"
                ? "text-text"
                : "text-muted",
          )}
        >
          {title}
        </h3>
        {action ? (
          <Link
            href={action.href}
            className="text-12 text-subtle transition-colors hover:text-text"
          >
            {action.label}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

export function List({ children }: { children: ReactNode }) {
  return <ul className="-mx-2 flex flex-col">{children}</ul>;
}

export function Row({
  href,
  title,
  meta,
  trailing,
  leading,
  alert,
}: {
  href: string;
  title: string;
  meta?: string | null;
  trailing?: string | null;
  leading?: ReactNode;
  alert?: boolean;
}) {
  return (
    <li className="border-b border-border last:border-b-0">
      <Link
        href={href}
        className="touch-row flex items-center gap-3 rounded-md px-2 py-2.5 transition-colors hover:bg-fill"
      >
        {leading}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-14">{title}</span>
          {meta ? (
            <span className="mt-0.5 block truncate text-12 text-subtle">{meta}</span>
          ) : null}
        </span>
        {trailing ? (
          <span
            className={cn(
              "tabular shrink-0 text-12",
              alert ? "text-danger" : "text-subtle",
            )}
          >
            {trailing}
          </span>
        ) : null}
      </Link>
    </li>
  );
}

export function StatStrip({
  items,
}: {
  items: {
    label: string;
    value: number;
    href?: string;
    alert?: boolean;
  }[];
}) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-4 border-b border-border pb-6 sm:flex sm:flex-wrap sm:items-end sm:gap-x-10">
      {items.map((item) => {
        const body = (
          <div className="flex flex-col-reverse">
            <dt className="mt-1 text-13 text-subtle">{item.label}</dt>
            <dd
              className={cn(
                "tabular text-24",
                item.alert && item.value > 0 ? "text-danger" : "text-text",
              )}
            >
              {item.value}
            </dd>
          </div>
        );
        return (
          <div key={item.label} className="min-w-16">
            {item.href ? (
              <Link
                href={item.href}
                className="block rounded-md transition-colors hover:opacity-80"
              >
                {body}
              </Link>
            ) : (
              body
            )}
          </div>
        );
      })}
    </dl>
  );
}

export function InlineEmpty({ children }: { children: ReactNode }) {
  return <p className="text-13 text-subtle">{children}</p>;
}

export function TextAction({
  children,
  onClick,
}: {
  children: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="cursor-pointer text-13 text-text underline-offset-4 hover:underline"
    >
      {children}
    </button>
  );
}
