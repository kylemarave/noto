"use client";

import { useEffect, useState } from "react";
import { Bell, Menu, Search, Settings2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";

const TITLES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/inbox": "Inbox",
  "/tasks": "Tasks",
  "/projects": "Projects",
  "/calendar": "Calendar",
  "/notes": "Notes",
  "/settings": "Settings",
};

function isAppleDevice() {
  if (typeof navigator === "undefined") return false;
  return /Mac|iPhone|iPad|iPod/.test(navigator.userAgent);
}

export function Header({
  onSearch,
  onQuickAdd,
  onMenu,
}: {
  onSearch: () => void;
  onQuickAdd: () => void;
  onMenu: () => void;
}) {
  const pathname = usePathname();
  const [shortcut, setShortcut] = useState("Ctrl K");
  const title =
    TITLES[pathname] ??
    (pathname.startsWith("/projects/")
      ? "Project"
      : pathname.startsWith("/notes/")
        ? "Note"
        : "Noto");

  useEffect(() => {
    setShortcut(isAppleDevice() ? "⌘K" : "Ctrl K");
  }, []);

  return (
    <header className="flex min-h-14 shrink-0 items-center gap-2 border-b border-border px-3 pt-[env(safe-area-inset-top)] md:gap-3 md:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="inline-flex size-11 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" strokeWidth={1.25} />
      </button>
      <h1 className="truncate text-14 font-medium">{title}</h1>
      <button
        type="button"
        onClick={onSearch}
        className="mx-auto hidden h-11 w-full max-w-md cursor-pointer items-center gap-2 rounded-[10px] border border-border bg-surface px-3 text-13 text-subtle hover:border-line md:flex"
      >
        <Search className="size-4" strokeWidth={1.25} />
        <span>Search</span>
        <kbd className="ml-auto hidden rounded-md border border-border px-1.5 py-0.5 text-12 text-muted lg:inline">
          {shortcut}
        </kbd>
      </button>
      <div className="ml-auto flex items-center gap-1 md:ml-0">
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text md:hidden"
          aria-label="Search"
        >
          <Search className="size-4" strokeWidth={1.25} />
        </button>
        <button
          type="button"
          className="hidden size-11 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text md:inline-flex"
          aria-label="Notifications"
        >
          <Bell className="size-4" strokeWidth={1.25} />
        </button>
        <Link
          href="/settings"
          className="hidden size-11 items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text md:inline-flex"
          aria-label="Settings"
        >
          <Settings2 className="size-4" strokeWidth={1.25} />
        </Link>
        <Button size="sm" className="min-h-11 px-3" onClick={onQuickAdd}>
          + New
        </Button>
      </div>
    </header>
  );
}
