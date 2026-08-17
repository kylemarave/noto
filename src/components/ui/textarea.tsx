import type { TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Textarea({
  className,
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className={cn(
        "min-h-28 w-full rounded-[10px] border border-border bg-fill px-3 py-2 text-14 text-text outline-none transition-colors placeholder:text-subtle hover:border-line focus:border-line",
        className,
      )}
      {...props}
    />
  );
}
