import {
  Calendar,
  File,
  Folder,
  Grid2x2,
  Inbox,
  List,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

export const NAV_ICON_CLASS = "size-4 shrink-0";
export const NAV_ICON_STROKE = 1.25;

export const NAV_ITEMS: { href: string; label: string; icon: LucideIcon }[] = [
  { href: "/dashboard", label: "Dashboard", icon: Grid2x2 },
  { href: "/inbox", label: "Inbox", icon: Inbox },
  { href: "/tasks", label: "Tasks", icon: List },
  { href: "/projects", label: "Projects", icon: Folder },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/notes", label: "Notes", icon: File },
];

export function NavIcon({
  icon: Icon,
  className,
}: {
  icon: LucideIcon;
  className?: string;
}) {
  return <Icon className={cn(NAV_ICON_CLASS, className)} strokeWidth={NAV_ICON_STROKE} />;
}
