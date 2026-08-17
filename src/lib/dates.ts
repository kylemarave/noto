import { format } from "date-fns";

export function toDateInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd");
}

export function toDateTimeInput(value?: Date | string | null) {
  if (!value) return "";
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "";
  return format(date, "yyyy-MM-dd'T'HH:mm");
}

export function formatDue(value?: Date | string | null) {
  if (!value) return null;
  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return null;
  return format(date, "MMM d");
}

export function formatWhen(value: Date | string) {
  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "MMM d, h:mm a");
}
