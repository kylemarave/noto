import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-[10px] border border-border bg-fill px-3 text-14 text-text outline-none transition-colors placeholder:text-subtle hover:border-line focus:border-line",
        className,
      )}
      {...props}
    />
  );
}
