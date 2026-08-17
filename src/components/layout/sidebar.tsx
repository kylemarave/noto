"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Plus, Settings2 } from "lucide-react";
import type { ReactNode } from "react";
import { cn, initials } from "@/lib/utils";
import { logoutAction } from "@/server/actions/auth";
import type { WorkspaceUser } from "@/server/queries";
import { NAV_ITEMS, NavIcon } from "./nav-icons";

export function Sidebar({
  user,
  favorites,
  collapsed,
  onToggle,
  onQuickAdd,
  inboxCount,
}: {
  user: WorkspaceUser;
  favorites: { id: string; project: { id: string; name: string; color: string } }[];
  collapsed: boolean;
  onToggle: () => void;
  onQuickAdd: () => void;
  inboxCount: number;
}) {
  const pathname = usePathname();

  return (
    <aside
      className={cn(
        "hidden h-dvh shrink-0 flex-col border-r border-border bg-surface md:flex",
        collapsed ? "w-[72px]" : "w-[248px]",
      )}
    >
      <div className={cn("flex h-14 items-center gap-2 px-3", collapsed && "justify-center")}>
        <Mark />
        {!collapsed ? (
          <span className="text-14 font-medium tracking-[-0.15px]">Noto</span>
        ) : null}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "ml-auto inline-flex size-8 cursor-pointer items-center justify-center rounded-md text-muted hover:bg-fill hover:text-text",
            collapsed && "ml-0",
          )}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <PanelLeft className="size-4" strokeWidth={1.25} />
        </button>
      </div>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onQuickAdd}
          className={cn(
            "inverse flex h-9 w-full cursor-pointer items-center justify-center gap-2 rounded-[10px] text-13 font-medium hover:opacity-90",
            collapsed && "px-0",
          )}
        >
          <Plus className="size-3.5" strokeWidth={1.5} />
          {!collapsed ? "New" : <span className="sr-only">New</span>}
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-6 overflow-y-auto px-3 pb-4 scrollbar-thin">
        <NavGroup title={collapsed ? undefined : "Workspace"}>
          {NAV_ITEMS.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <NavLink
                key={item.href}
                href={item.href}
                active={active}
                collapsed={collapsed}
                icon={<NavIcon icon={item.icon} />}
                badge={item.href === "/inbox" && inboxCount > 0 ? inboxCount : undefined}
              >
                {item.label}
              </NavLink>
            );
          })}
        </NavGroup>

        {!collapsed && favorites.length > 0 ? (
          <NavGroup title="Favorites">
            {favorites.map((favorite) => (
              <NavLink
                key={favorite.id}
                href={`/projects/${favorite.project.id}`}
                active={pathname === `/projects/${favorite.project.id}`}
                collapsed={false}
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
            active={pathname === "/settings"}
            collapsed={collapsed}
            icon={<NavIcon icon={Settings2} />}
          >
            Settings
          </NavLink>
        </div>
      </nav>

      <div className="border-t border-border p-3">
        <div className={cn("flex items-center gap-2", collapsed && "justify-center")}>
          <div className="flex size-8 items-center justify-center rounded-full bg-fill text-12 font-medium">
            {initials(user.name)}
          </div>
          {!collapsed ? (
            <div className="min-w-0 flex-1">
              <p className="truncate text-12 font-medium">{user.name}</p>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="cursor-pointer text-12 text-muted hover:text-text"
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
  active,
  collapsed,
  icon,
  children,
  badge,
}: {
  href: string;
  active: boolean;
  collapsed: boolean;
  icon: ReactNode;
  children: ReactNode;
  badge?: number;
}) {
  return (
    <Link
      href={href}
      title={collapsed ? String(children) : undefined}
      className={cn(
        "flex h-9 items-center gap-2.5 rounded-[8px] px-2.5 text-12 font-medium transition-colors",
        active ? "inverse" : "text-muted hover:bg-fill hover:text-text",
        collapsed && "justify-center px-0",
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
      {!collapsed ? <span className="truncate">{children}</span> : null}
      {!collapsed && badge ? (
        <span
          className={cn(
            "ml-auto flex size-4 items-center justify-center rounded-full text-12",
            active ? "bg-black/10" : "bg-fill",
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
  const items = NAV_ITEMS.slice(0, 5);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-14 items-center justify-around border-t border-border bg-surface px-2 pb-[env(safe-area-inset-bottom)] md:hidden">
      {items.map((item) => {
        const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "relative flex size-10 items-center justify-center rounded-full",
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
