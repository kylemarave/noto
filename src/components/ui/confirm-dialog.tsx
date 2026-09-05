"use client";

import * as AlertDialog from "@radix-ui/react-alert-dialog";
import { Button } from "./button";

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}) {
  return (
    <AlertDialog.Root open={open} onOpenChange={onOpenChange}>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/60" />
        <AlertDialog.Content className="fixed top-1/2 left-1/2 z-50 w-[min(420px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2 rounded-lg border border-line bg-surface p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-[0_24px_60px_rgba(0,0,0,0.5)]">
          <AlertDialog.Title className="text-14 font-medium text-text">
            {title}
          </AlertDialog.Title>
          <AlertDialog.Description className="mt-2 text-13 text-muted">
            {description}
          </AlertDialog.Description>
          <div className="mt-5 flex flex-wrap justify-end gap-2 border-t border-border pt-4">
            <AlertDialog.Cancel asChild>
              <Button variant="ghost">Cancel</Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <Button
                variant="danger"
                onClick={() => {
                  void onConfirm();
                }}
              >
                {confirmLabel}
              </Button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
