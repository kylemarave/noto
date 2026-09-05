import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Projects keep a stored hex, but the workspace renders monochrome.
 * Collapse any color to its perceived lightness so old data still reads
 * as a distinct tone without reintroducing hue.
 */
export function monoTint(hex: string) {
  const value = hex.replace("#", "");
  if (value.length !== 6) return "var(--text-muted)";
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  if ([r, g, b].some(Number.isNaN)) return "var(--text-muted)";
  const luminance = Math.round(0.2126 * r + 0.7152 * g + 0.0722 * b);
  const level = Math.min(235, Math.max(120, luminance));
  return `rgb(${level} ${level} ${level})`;
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}
