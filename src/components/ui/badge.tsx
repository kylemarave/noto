import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({
  className,
  tone = "neutral",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "neutral" | "solid" | "success" | "warning" | "danger";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-md px-2 text-12 font-medium",
        tone === "neutral" && "border border-line text-muted",
        tone === "solid" && "inverse",
        tone === "success" && "text-success",
        tone === "warning" && "text-warning",
        tone === "danger" && "text-danger",
        className,
      )}
      {...props}
    />
  );
}
