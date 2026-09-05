"use client";

import { useEffect, useState } from "react";
import { Menu, Search } from "lucide-react";
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
    <header className="flex min-h-14 shrink-0 items-center gap-3 border-b border-border px-4 pt-[env(safe-area-inset-top)] md:px-6">
      <button
        type="button"
        onClick={onMenu}
        className="-ml-1.5 inline-flex size-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-fill hover:text-text lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="size-4" strokeWidth={1.25} />
      </button>
      <h1 className="min-w-0 truncate text-14 font-medium">{title}</h1>
      <div className="ml-auto flex shrink-0 items-center gap-2">
        <button
          type="button"
          onClick={onSearch}
          className="hidden h-9 w-56 cursor-pointer items-center gap-2 rounded-md bg-fill px-3 text-13 text-subtle transition-colors hover:text-muted md:flex lg:w-72"
        >
          <Search className="size-4 shrink-0" strokeWidth={1.25} />
          <span>Search</span>
          <kbd className="ml-auto hidden text-12 text-subtle lg:inline">{shortcut}</kbd>
        </button>
        <button
          type="button"
          onClick={onSearch}
          className="inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:bg-fill hover:text-text md:hidden"
          aria-label="Search"
        >
          <Search className="size-4" strokeWidth={1.25} />
        </button>
        <Button onClick={onQuickAdd}>
          New
        </Button>
      </div>
    </header>
  );
}
