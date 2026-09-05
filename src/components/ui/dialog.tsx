"use client";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import type { ReactNode } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: ReactNode;
}) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      {children}
    </DialogPrimitive.Root>
  );
}

export function DialogContent({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <DialogPrimitive.Portal>
      <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/60" />
      <DialogPrimitive.Content
        className={cn(
          "fixed top-1/2 left-1/2 z-50 max-h-[min(90dvh,calc(100dvh-2rem))] w-[min(520px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto overscroll-contain rounded-lg border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_24px_60px_rgba(0,0,0,0.5)]",
          className,
        )}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <DialogPrimitive.Title className="text-14 font-medium text-text">
              {title}
            </DialogPrimitive.Title>
            {description ? (
              <DialogPrimitive.Description className="text-13 text-muted">
                {description}
              </DialogPrimitive.Description>
            ) : (
              <DialogPrimitive.Description className="sr-only">
                {title}
              </DialogPrimitive.Description>
            )}
          </div>
          <DialogPrimitive.Close className="-mt-1 -mr-1 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors hover:bg-fill hover:text-text">
            <X className="size-4" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
        {children}
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  );
}

export function DialogActions({
  leading,
  children,
}: {
  leading?: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
      {leading ?? <span />}
      <div className="ml-auto flex flex-wrap justify-end gap-2">{children}</div>
    </div>
  );
}
