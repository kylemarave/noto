"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { PanelLeft, Settings2, X } from "lucide-react";
import type { ReactNode } from "react";
import { cn, initials, monoTint } from "@/lib/utils";
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
  inboxCount,
}: {
  user: WorkspaceUser;
  favorites: { id: string; project: { id: string; name: string; color: string } }[];
  collapsed: boolean;
  overlayOpen: boolean;
  onToggle: () => void;
  onCloseOverlay: () => void;
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
      <div
        className={cn(
          "flex h-14 items-center gap-2 px-3",
          collapsed && "lg:justify-center lg:px-0",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center">
          <Mark />
        </span>
        {collapsed && !overlayOpen ? null : (
          <span className="text-14 font-medium">Noto</span>
        )}
        <button
          type="button"
          onClick={onToggle}
          className={cn(
            "ml-auto hidden size-9 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors hover:bg-fill hover:text-text lg:inline-flex",
            collapsed && "lg:hidden",
          )}
          aria-label="Collapse sidebar"
        >
          <PanelLeft className="size-4" strokeWidth={1.25} />
        </button>
        <button
          type="button"
          onClick={onCloseOverlay}
          className="ml-auto inline-flex size-10 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors hover:bg-fill hover:text-text lg:hidden"
          aria-label="Close menu"
        >
          <X className="size-4" strokeWidth={1.25} />
        </button>
      </div>

      {collapsed ? (
        <button
          type="button"
          onClick={onToggle}
          className="mx-auto mb-2 hidden size-9 cursor-pointer items-center justify-center rounded-md text-subtle transition-colors hover:bg-fill hover:text-text lg:inline-flex"
          aria-label="Expand sidebar"
        >
          <PanelLeft className="size-4" strokeWidth={1.25} />
        </button>
      ) : null}

      <nav
        className={cn(
          "flex min-h-0 flex-1 flex-col gap-7 overflow-y-auto overscroll-contain px-3 pb-4 scrollbar-thin",
          collapsed && "lg:px-2",
        )}
      >
        <div className="flex flex-col gap-0.5">
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
        </div>

        {favorites.length > 0 ? (
          <div className="flex flex-col gap-0.5">
            {collapsed && !overlayOpen ? null : (
              <p className="px-2.5 pb-1.5 text-12 text-subtle">Favorites</p>
            )}
            {favorites.map((favorite) => (
              <NavLink
                key={favorite.id}
                href={`/projects/${favorite.project.id}`}
                collapsed={collapsed && !overlayOpen}
                exact
                onNavigate={onCloseOverlay}
                icon={
                  <span
                    className="size-1.5 shrink-0 rounded-full"
                    style={{ background: monoTint(favorite.project.color) }}
                  />
                }
              >
                {favorite.project.name}
              </NavLink>
            ))}
          </div>
        ) : null}

        <div className="mt-auto flex flex-col gap-0.5">
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

      <div
        className={cn(
          "flex items-center gap-2.5 border-t border-border p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]",
          collapsed && "lg:justify-center",
        )}
      >
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-fill text-12 font-medium text-muted">
          {initials(user.name)}
        </span>
        {collapsed && !overlayOpen ? null : (
          <div className="min-w-0 flex-1">
            <p className="truncate text-12 font-medium">{user.name}</p>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex min-h-8 cursor-pointer items-center text-left text-12 text-subtle transition-colors hover:text-text"
              >
                Sign out
              </button>
            </form>
          </div>
        )}
      </div>
    </aside>
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
        "touch-row flex min-h-11 items-center gap-2.5 rounded-md px-2.5 text-12 font-medium transition-colors duration-100 lg:min-h-9",
        active ? "inverse" : "text-muted hover:bg-fill hover:text-text",
        collapsed && "lg:justify-center lg:px-0",
      )}
    >
      <span className="flex size-4 shrink-0 items-center justify-center">{icon}</span>
      <span className={cn("truncate", collapsed && "lg:hidden")}>{children}</span>
      {badge ? (
        <span
          className={cn(
            "ml-auto tabular text-12",
            active ? "opacity-60" : "text-subtle",
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
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-[calc(4.25rem+env(safe-area-inset-bottom))] items-center justify-around border-t border-border bg-surface px-1 pb-[env(safe-area-inset-bottom)] md:hidden">
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
              "relative flex min-h-12 min-w-0 flex-1 flex-col items-center justify-center gap-1 rounded-md px-1 transition-colors",
              active ? "text-text" : "text-muted",
            )}
            aria-current={active ? "page" : undefined}
            aria-label={item.label}
          >
            <span
              className={cn(
                "relative flex size-8 items-center justify-center rounded-md",
                active && "inverse",
              )}
            >
              <NavIcon icon={item.icon} />
              {item.href === "/inbox" && inboxCount > 0 && !active ? (
                <span className="absolute top-1 right-1 size-1.5 rounded-full bg-text" />
              ) : null}
            </span>
            <span className="max-w-full truncate text-12 leading-none">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
