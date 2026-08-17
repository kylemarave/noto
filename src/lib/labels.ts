import type { InboxKind, ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";
import {
  INBOX_KINDS,
  PROJECT_STATUSES,
  TASK_COLUMNS,
  TASK_PRIORITIES,
} from "./constants";

export function taskStatusLabel(status: TaskStatus) {
  return TASK_COLUMNS.find((column) => column.id === status)?.label ?? status;
}

export function priorityLabel(priority: TaskPriority) {
  return TASK_PRIORITIES.find((item) => item.id === priority)?.label ?? priority;
}

export function projectStatusLabel(status: ProjectStatus) {
  return PROJECT_STATUSES.find((item) => item.id === status)?.label ?? status;
}

export function inboxKindLabel(kind: InboxKind) {
  return INBOX_KINDS.find((item) => item.id === kind)?.label ?? kind;
}
