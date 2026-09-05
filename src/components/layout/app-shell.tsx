"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./header";
import { MobileBottomNav, Sidebar } from "./sidebar";
import { CommandPalette } from "@/components/command/command-palette";
import { QuickAdd } from "@/components/quick-add/quick-add";
import { QuickAddContext } from "@/components/quick-add/quick-add-context";
import { NavPendingProvider } from "./nav-pending";
import type { ProjectOption, WorkspaceUser } from "@/server/queries";

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
  projects: ProjectOption[];
  children: ReactNode;
}) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [quickOpen, setQuickOpen] = useState(false);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(COLLAPSE_KEY) === "1");
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

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
      if (event.key === "Escape") setMenuOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, [menuOpen]);

  function toggleCollapsed() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(COLLAPSE_KEY, next ? "1" : "0");
      return next;
    });
  }

  return (
    <NavPendingProvider>
      <QuickAddContext.Provider value={() => setQuickOpen(true)}>
        <div className="flex h-dvh overflow-hidden bg-bg text-text">
          {menuOpen ? (
            <button
              type="button"
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
              aria-label="Close menu"
              onClick={() => setMenuOpen(false)}
            />
          ) : null}
          <Sidebar
            user={user}
            favorites={favorites}
            collapsed={collapsed}
            overlayOpen={menuOpen}
            onToggle={toggleCollapsed}
            onCloseOverlay={() => setMenuOpen(false)}
            inboxCount={inboxCount}
          />
          <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <Header
              onSearch={() => setSearchOpen(true)}
              onQuickAdd={() => setQuickOpen(true)}
              onMenu={() => setMenuOpen(true)}
            />
            <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain text-14">
              <div className="flex min-h-full flex-col px-4 py-5 pb-[calc(6.25rem+env(safe-area-inset-bottom))] md:px-6 md:py-6 md:pb-6">
                {children}
              </div>
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
      </QuickAddContext.Provider>
    </NavPendingProvider>
  );
}
