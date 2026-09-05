import { cache } from "react";
import type { InboxKind, Prisma, TaskStatus } from "@prisma/client";
import { db } from "@/lib/db";
import { startOfDay, endOfDay, addDays } from "date-fns";

export type WorkspaceUser = {
  id: string;
  name: string;
  email: string;
};

const taskInclude = {
  project: { select: { id: true, name: true, color: true } },
  subtasks: { orderBy: { position: "asc" as const } },
  tags: { include: { tag: true } },
} satisfies Prisma.TaskInclude;

const noteInclude = {
  project: { select: { id: true, name: true, color: true } },
  tags: { include: { tag: true } },
} satisfies Prisma.NoteInclude;

export const getProjects = cache(async (userId: string) => {
  return db.project.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    orderBy: { updatedAt: "desc" },
    include: {
      _count: { select: { tasks: true, notes: true, events: true } },
      tasks: { select: { status: true } },
      favorite: true,
    },
  });
});

export const getProjectOptions = cache(async (userId: string) => {
  return db.project.findMany({
    where: { userId, status: { not: "ARCHIVED" } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
});

export const getProject = cache(async (userId: string, id: string) => {
  return db.project.findFirst({
    where: { id, userId },
    include: {
      tasks: { include: taskInclude, orderBy: { position: "asc" } },
      notes: { include: noteInclude, orderBy: { updatedAt: "desc" } },
      events: {
        orderBy: { startAt: "asc" },
        include: {
          project: { select: { id: true, name: true, color: true } },
          task: { select: { id: true, title: true, dueDate: true } },
        },
      },
      favorite: true,
      _count: { select: { tasks: true, notes: true, events: true } },
    },
  });
});

export const getTasks = cache(async (userId: string, projectId?: string) => {
  return db.task.findMany({
    where: { userId, ...(projectId ? { projectId } : {}) },
    include: taskInclude,
    orderBy: [{ position: "asc" }, { createdAt: "asc" }],
  });
});

export const getCalendarTasks = cache(async (userId: string) => {
  return db.task.findMany({
    where: { userId },
    select: { id: true, title: true, dueDate: true },
    orderBy: { dueDate: "asc" },
  });
});

export const getNotes = cache(async (
  userId: string,
  options?: { archived?: boolean | "all" },
) => {
  const archived = options?.archived ?? false;
  return db.note.findMany({
    where: {
      userId,
      ...(archived === "all" ? {} : { archived }),
    },
    include: noteInclude,
    orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
  });
});

export const getNote = cache(async (userId: string, id: string) => {
  return db.note.findFirst({
    where: { id, userId },
    include: noteInclude,
  });
});

export const getEvents = cache(async (userId: string, range?: { from: Date; to: Date }) => {
  return db.calendarEvent.findMany({
    where: {
      userId,
      ...(range
        ? { startAt: { gte: range.from, lte: range.to } }
        : {}),
    },
    include: {
      project: { select: { id: true, name: true, color: true } },
      task: { select: { id: true, title: true, dueDate: true } },
    },
    orderBy: { startAt: "asc" },
  });
});

export const getInbox = cache(async (userId: string) => {
  return db.inboxItem.findMany({
    where: { userId, processed: false },
    orderBy: { createdAt: "desc" },
  });
});

export const getInboxCount = cache(async (userId: string) => {
  return db.inboxItem.count({ where: { userId, processed: false } });
});

export const getRecentInbox = cache(async (userId: string) => {
  return db.inboxItem.findMany({
    where: { userId, processed: true },
    orderBy: { updatedAt: "desc" },
    take: 5,
  });
});

export const getFavorites = cache(async (userId: string) => {
  return db.favorite.findMany({
    where: { userId },
    include: { project: { select: { id: true, name: true, color: true } } },
    orderBy: { project: { name: "asc" } },
  });
});

export async function getTags(userId: string) {
  return db.tag.findMany({
    where: { userId },
    orderBy: { name: "asc" },
  });
}

export const getDashboard = cache(async (userId: string) => {
  const now = new Date();
  const todayStart = startOfDay(now);
  const todayEnd = endOfDay(now);
  const upcomingEnd = endOfDay(addDays(now, 7));

  const [
    todayTasks,
    overdueTasks,
    unscheduledTasks,
    upcomingTasks,
    events,
    notes,
    projects,
    statusCounts,
    inboxPreview,
    inboxCount,
  ] = await Promise.all([
      db.task.findMany({
        where: {
          userId,
          status: { not: "DONE" },
          dueDate: { gte: todayStart, lte: todayEnd },
        },
        include: taskInclude,
        orderBy: { dueDate: "asc" },
      }),
      db.task.findMany({
        where: {
          userId,
          status: { not: "DONE" },
          dueDate: { lt: todayStart },
        },
        include: taskInclude,
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      db.task.findMany({
        where: {
          userId,
          status: { not: "DONE" },
          dueDate: null,
        },
        include: taskInclude,
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
      db.task.findMany({
        where: {
          userId,
          status: { not: "DONE" },
          dueDate: { gt: todayEnd, lte: upcomingEnd },
        },
        include: taskInclude,
        orderBy: { dueDate: "asc" },
        take: 8,
      }),
      db.calendarEvent.findMany({
        where: { userId, startAt: { gte: todayStart, lte: upcomingEnd } },
        include: { project: { select: { id: true, name: true, color: true } } },
        orderBy: { startAt: "asc" },
        take: 6,
      }),
      db.note.findMany({
        where: { userId, archived: false },
        include: noteInclude,
        orderBy: { updatedAt: "desc" },
        take: 4,
      }),
      db.project.findMany({
        where: { userId, status: { not: "ARCHIVED" } },
        orderBy: { updatedAt: "desc" },
        take: 6,
        select: {
          id: true,
          name: true,
          color: true,
          description: true,
          tasks: { select: { status: true } },
        },
      }),
      db.task.groupBy({
        by: ["status"],
        where: { userId },
        _count: { _all: true },
      }),
      db.inboxItem.findMany({
        where: { userId, processed: false },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      getInboxCount(userId),
    ]);

  const countFor = (status: TaskStatus) =>
    statusCounts.find((row) => row.status === status)?._count._all ?? 0;

  const stats = {
    todo: countFor("TODO") + countFor("BACKLOG"),
    inProgress: countFor("IN_PROGRESS"),
    review: countFor("REVIEW"),
    done: countFor("DONE"),
    total: statusCounts.reduce((sum, row) => sum + row._count._all, 0),
  };

  return {
    todayTasks,
    overdueTasks,
    unscheduledTasks,
    upcomingTasks,
    events,
    notes,
    projects,
    stats,
    inboxPreview,
    inboxCount,
  };
});

export async function searchWorkspace(userId: string, query: string) {
  const q = query.trim();
  if (q.length < 1) {
    return { tasks: [], projects: [], notes: [], events: [] };
  }

  const [tasks, projects, notes, events] = await Promise.all([
    db.task.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: q } },
          { description: { contains: q } },
        ],
      },
      include: { project: { select: { name: true } } },
      take: 6,
    }),
    db.project.findMany({
      where: {
        userId,
        OR: [{ name: { contains: q } }, { description: { contains: q } }],
      },
      take: 6,
    }),
    db.note.findMany({
      where: {
        userId,
        archived: false,
        OR: [{ title: { contains: q } }, { content: { contains: q } }],
      },
      take: 6,
    }),
    db.calendarEvent.findMany({
      where: {
        userId,
        OR: [{ title: { contains: q } }, { description: { contains: q } }],
      },
      take: 6,
    }),
  ]);

  return { tasks, projects, notes, events };
}

export type ProjectOption = Awaited<ReturnType<typeof getProjectOptions>>[number];
export type CalendarTask = Awaited<ReturnType<typeof getCalendarTasks>>[number];
export type TaskWithRelations = Prisma.TaskGetPayload<{ include: typeof taskInclude }>;
export type NoteWithRelations = Prisma.NoteGetPayload<{ include: typeof noteInclude }>;
export type ProjectListItem = Awaited<ReturnType<typeof getProjects>>[number];
export type DashboardData = Awaited<ReturnType<typeof getDashboard>>;
export type SearchResults = Awaited<ReturnType<typeof searchWorkspace>>;
export type InboxItemRecord = Awaited<ReturnType<typeof getInbox>>[number];
export type EventRecord = Awaited<ReturnType<typeof getEvents>>[number];
export type TagRecord = Awaited<ReturnType<typeof getTags>>[number];

export async function ensureTags(userId: string, names: string[]) {
  const cleaned = [...new Set(names.map((name) => name.trim()).filter(Boolean))];
  const tags = [];
  for (const name of cleaned) {
    const tag = await db.tag.upsert({
      where: { userId_name: { userId, name } },
      update: {},
      create: { userId, name },
    });
    tags.push(tag);
  }
  return tags;
}

export type { InboxKind };
