import type { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5" htmlFor={htmlFor}>
      <span className="text-12 font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}

export function FieldHint({
  className,
  ...props
}: LabelHTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-12 text-subtle", className)} {...props} />;
}
