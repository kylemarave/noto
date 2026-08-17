"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Header } from "./header";
import { MobileBottomNav, Sidebar } from "./sidebar";
import { CommandPalette } from "@/components/command/command-palette";
import { QuickAdd } from "@/components/quick-add/quick-add";
import type { ProjectListItem, WorkspaceUser } from "@/server/queries";

const COLLAPSE_KEY = "noto-sidebar-collapsed";

export function AppShell({
  user,
  favorites,
  inboxCount,
  projects,
  children,
}: {
  user: WorkspaceUser;
  favorites: { id: string; project: { id: string; name: string; color: string } }[];
  inboxCount: number;
  projects: ProjectListItem[];
  children: ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      }
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setQuickOpen(true);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <div className="flex min-h-dvh bg-bg text-text">
      <Sidebar
        user={user}
        favorites={favorites}
        collapsed={collapsed}
        onToggle={toggleCollapsed}
        onQuickAdd={() => setQuickOpen(true)}
        inboxCount={inboxCount}
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <Header
          onSearch={() => setSearchOpen(true)}
          onQuickAdd={() => setQuickOpen(true)}
        />
        <main className="flex-1 overflow-y-auto px-4 py-5 pb-20 text-14 md:px-6 md:pb-6">
          {children}
        </main>
      </div>
      <MobileBottomNav inboxCount={inboxCount} />
      <CommandPalette open={searchOpen} onOpenChange={setSearchOpen} />
      <QuickAdd
        open={quickOpen}
        onOpenChange={setQuickOpen}
        projects={projects}
      />
    </div>
  );
}
