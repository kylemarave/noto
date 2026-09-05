import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

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
        "flex flex-col items-start gap-2 border-t border-border py-8",
        className,
      )}
    >
      <h2 className="text-14 font-medium text-text">{title}</h2>
      <p className="max-w-sm text-13 text-subtle">{description}</p>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
