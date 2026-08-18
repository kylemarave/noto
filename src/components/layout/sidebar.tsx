"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Plus, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import type { WorkspaceUser } from "@/server/queries";
import { NAV_ITEMS, NavIcon } from "./nav-icons";
import { useNavPending } from "./nav-pending";

export function Sidebar({
  user,
  favorites,
  collapsed,
  overlayOpen,
  onToggle,
  onCloseOverlay,
  onQuickAdd,
  inboxCount,
}: {
  user: WorkspaceUser;
  favorites: { id: string; project: { id: string; name: string; color: string } }[];
  collapsed: boolean;
  overlayOpen: boolean;
  onToggle: () => void;
  onCloseOverlay: () => void;
  onQuickAdd: () => void;
  inboxCount: number;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex h-dvh w-[min(280px,86vw)] shrink-0 flex-col border-r border-border bg-surface pt-[env(safe-area-inset-top)] transition-transform duration-200 lg:static lg:z-auto lg:w-auto lg:translate-x-0 lg:transition-none",
        overlayOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        collapsed ? "lg:w-[72px]" : "lg:w-[248px]",
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-3", collapsed && "lg:justify-center")}>
        <Mark />
        {!collapsed || overlayOpen ? (
          <span className="text-14 font-medium tracking-[-0.15px] lg:inline">
            {collapsed && !overlayOpen ? null : "Noto"}
          </span>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className="ml-auto hidden size-11 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text lg:inline-flex"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="size-4" strokeWidth={1.25} />
        </button>
        <button
          type="button"
          onClick={onCloseOverlay}
          className="ml-auto inline-flex size-11 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text lg:hidden"
          aria-label="Close menu"
        >
          <PanelLeft className="size-4" strokeWidth={1.25} />
        </button>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onQuickAdd}
          className={cn(
            "inverse flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-13 font-medium hover:opacity-90",
            collapsed && "lg:px-0",
          )}
        >
          <Plus className="size-3.5" strokeWidth={1.5} />
          {collapsed ? (
            <span className="lg:sr-only">New</span>
          ) : (
            "New"
          )}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-3 pb-4 scrollbar-thin">
        <NavGroup title={collapsed ? undefined : "Workspace"}>
          {NAV_ITEMS.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                collapsed={collapsed}
                onNavigate={onCloseOverlay}
                icon={<NavIcon icon={item.icon} />}
                badge={item.href === "/inbox" && inboxCount > 0 ? inboxCount : undefined}
              >
                {item.label}
              </NavLink>
          ))}
        </NavGroup>

        {(!collapsed || overlayOpen) && favorites.length > 0 ? (
          <NavGroup title="Favorites">
            {favorites.map((favorite) => (
              <NavLink
                key={favorite.id}
                href={`/projects/${favorite.project.id}`}
                collapsed={false}
                exact
                onNavigate={onCloseOverlay}
                icon={
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: favorite.project.color }}
                  />
                }
              >
                {favorite.project.name}
              </NavLink>
            ))}
          </NavGroup>
        ) : null}

        <div className="mt-auto flex flex-col gap-1">
          <NavLink
            href="/settings"
            collapsed={collapsed}
            onNavigate={onCloseOverlay}
            icon={<NavIcon icon={Settings2} />}
          >
            Settings
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
        <div className={cn("flex items-center gap-2", collapsed && "lg:justify-center")}>
          <div className="flex size-10 items-center justify-center rounded-full bg-fill text-12 font-medium">
            {initials(user.name)}
          </div>
          {!collapsed || overlayOpen ? (
            <div className="min-w-0 flex-1 lg:block">
              <p className="truncate text-12 font-medium">{user.name}</p>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="min-h-11 cursor-pointer text-left text-12 text-muted hover:text-text"
                >
                  Sign out
                </button>
              </form>
            </div>
          ) : null}
        </div>
      </div>
    </aside>
  );
}

function NavGroup({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      {title ? (
        <p className="px-2 pb-1 text-12 font-medium text-subtle">{title}</p>
      ) : null}
      {children}
    </div>
  );
}

function NavLink({
  href,
  collapsed,
  icon,
  children,
  badge,
  exact,
  onNavigate,
}: {
  href: string;
  collapsed: boolean;
  icon: ReactNode;
  children: ReactNode;
  badge?: number;
  exact?: boolean;
  onNavigate: () => void;
}) {
  const pathname = usePathname();
  const { pendingHref, start } = useNavPending();
  const match = (value: string) =>
    exact ? value === href : value === href || value.startsWith(`${href}/`);
  const active = pendingHref ? match(pendingHref) : match(pathname);

  return (
    <Link
      href={href}
      prefetch
      title={collapsed ? String(children) : undefined}
      onClick={() => {
        onNavigate();
        if (href !== pathname) start(href);
      }}
      className={cn(
        "touch-row flex min-h-11 items-center gap-2.5 rounded-[8px] px-2.5 text-12 font-medium transition-colors",
        active ? "inverse" : "text-muted hover:bg-fill hover:text-text",
        collapsed && "lg:justify-center lg:px-0",
      )}
    >
      <span
        className={cn(
          "flex size-4 items-center justify-center",
          active ? "text-inherit" : "text-current",
        )}
      >
        {icon}
      </span>
      <span className={cn("truncate", collapsed && "lg:hidden")}>{children}</span>
      {badge ? (
        <span
          className={cn(
            "ml-auto flex size-5 items-center justify-center rounded-full text-12",
            active ? "bg-black/10" : "bg-fill",
            collapsed && "lg:hidden",
          )}
        >
          {badge}
        </span>
      ) : null}
    </Link>
  );
}

export function Mark() {
  return (
    <svg viewBox="0 0 16 16" className="size-4" aria-hidden>
      <rect
        x="1.5"
        y="1.5"
        width="9"
        height="9"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
      <rect
        x="5.5"
        y="5.5"
        width="9"
        height="9"
        rx="1.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
      />
    </svg>
  );
}

export function MobileBottomNav({ inboxCount }: { inboxCount: number }) {
  const pathname = usePathname();
  const { pendingHref, start } = useNavPending();
  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(3.5rem+env(safe-area-inset-bottom))] items-center justify-around border-t border-border bg-surface px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => {
        const match = (value: string) =>
          value === item.href || value.startsWith(`${item.href}/`);
        const active = pendingHref ? match(pendingHref) : match(pathname);
        return (
          <Link
            key={item.href}
            href={item.href}
            prefetch
            onClick={() => {
              if (item.href !== pathname) start(item.href);
            }}
            className={cn(
              "relative flex size-11 items-center justify-center rounded-[10px]",
              active ? "inverse" : "text-muted",
            )}
            aria-label={item.label}
          >
            <NavIcon icon={item.icon} />
            {item.href === "/inbox" && inboxCount > 0 ? (
              <span className="absolute top-1.5 right-1.5 size-1.5 rounded-full bg-danger" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
