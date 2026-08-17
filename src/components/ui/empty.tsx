import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export function EmptyState({
  title,
  description,
  action,
  className,
}: {
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-start gap-3 rounded-[10px] border border-border bg-surface px-5 py-8",
        className,
      )}
    >
      <h2 className="text-14 font-medium text-text">{title}</h2>
      <p className="max-w-md text-13 text-muted">{description}</p>
      {action}
    </div>
  );
}

export function EmptyAction({
  children,
  ...props
}: HTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <Button type="button" {...props}>
      {children}
    </Button>
  );
}
