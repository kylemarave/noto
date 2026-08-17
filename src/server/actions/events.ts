"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function revalidateEvents() {
  revalidatePath("/calendar");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
}

export async function createEventAction(input: {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  projectId?: string | null;
  taskId?: string | null;
}) {
  const user = await requireUser();
  const title = input.title.trim();
  if (!title) return { error: "An event needs a title." };
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  if (Number.isNaN(startAt.getTime()) || Number.isNaN(endAt.getTime())) {
    return { error: "Choose a valid start and end time." };
  }
  if (endAt < startAt) return { error: "End time must be after the start time." };

  const event = await db.calendarEvent.create({
    data: {
      userId: user.id,
      title,
      description: input.description?.trim() ?? "",
      startAt,
      endAt,
      allDay: Boolean(input.allDay),
      projectId: input.projectId || null,
      taskId: input.taskId || null,
    },
  });
  revalidateEvents();
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  return { ok: true as const, id: event.id };
}

export async function updateEventAction(input: {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  allDay?: boolean;
  projectId?: string | null;
  taskId?: string | null;
}) {
  const user = await requireUser();
  const existing = await db.calendarEvent.findFirst({
    where: { id: input.id, userId: user.id },
  });
  if (!existing) return { error: "Event not found." };
  const title = input.title.trim();
  if (!title) return { error: "An event needs a title." };
  const startAt = new Date(input.startAt);
  const endAt = new Date(input.endAt);
  if (endAt < startAt) return { error: "End time must be after the start time." };

  await db.calendarEvent.update({
    where: { id: input.id },
    data: {
      title,
      description: input.description?.trim() ?? "",
      startAt,
      endAt,
      allDay: Boolean(input.allDay),
      projectId: input.projectId || null,
      taskId: input.taskId || null,
    },
  });
  revalidateEvents();
  return { ok: true as const };
}

export async function deleteEventAction(id: string) {
  const user = await requireUser();
  const existing = await db.calendarEvent.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Event not found." };
  await db.calendarEvent.delete({ where: { id } });
  revalidateEvents();
  return { ok: true as const };
}
