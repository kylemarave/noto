import type { InboxKind, ProjectStatus, TaskPriority, TaskStatus } from "@prisma/client";

export const TASK_COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: "BACKLOG", label: "Backlog" },
  { id: "TODO", label: "To Do" },
  { id: "IN_PROGRESS", label: "In Progress" },
  { id: "REVIEW", label: "Review" },
  { id: "DONE", label: "Done" },
];

export const TASK_PRIORITIES: { id: TaskPriority; label: string }[] = [
  { id: "LOW", label: "Low" },
  { id: "MEDIUM", label: "Medium" },
  { id: "HIGH", label: "High" },
  { id: "URGENT", label: "Urgent" },
];

export const PROJECT_STATUSES: { id: ProjectStatus; label: string }[] = [
  { id: "ACTIVE", label: "Active" },
  { id: "ON_HOLD", label: "On hold" },
  { id: "COMPLETED", label: "Completed" },
  { id: "ARCHIVED", label: "Archived" },
];

export const INBOX_KINDS: { id: InboxKind; label: string }[] = [
  { id: "TASK", label: "Task" },
  { id: "IDEA", label: "Idea" },
  { id: "NOTE", label: "Note" },
  { id: "REMINDER", label: "Reminder" },
];

export const PROJECT_COLORS = [
  "#FFFFFF",
  "#A8B4C4",
  "#7C9CBF",
  "#8BBF9F",
  "#E8B931",
  "#F07167",
  "#C4A7E7",
];
