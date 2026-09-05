import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-md font-medium leading-none transition-colors duration-100 disabled:pointer-events-none disabled:opacity-40",
  {
    variants: {
      variant: {
        primary: "inverse hover:opacity-90",
        ghost: "text-muted hover:bg-fill hover:text-text",
        outline: "bg-fill text-text hover:bg-fill-strong",
        danger: "bg-danger text-white hover:opacity-90",
      },
      size: {
        sm: "h-8 px-2.5 text-12",
        md: "h-9 px-3.5 text-13",
        lg: "h-10 px-4 text-14",
        icon: "size-8",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp className={cn(buttonVariants({ variant, size }), className)} {...props} />
  );
}
