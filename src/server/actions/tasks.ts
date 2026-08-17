"use server";

import type { TaskPriority, TaskStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ensureTags } from "@/server/queries";

function revalidateTasks() {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/calendar");
  revalidatePath("/projects");
}

export async function createTaskAction(input: {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId?: string | null;
  tags?: string[];
  subtasks?: string[];
}) {
  const user = await requireUser();
  const title = input.title.trim();
  if (!title) return { error: "A task needs a title." };

  const last = await db.task.findFirst({
    where: { userId: user.id, status: input.status ?? "TODO" },
    orderBy: { position: "desc" },
  });

  const tags = await ensureTags(user.id, input.tags ?? []);

  const task = await db.task.create({
    data: {
      userId: user.id,
      title,
      description: input.description?.trim() ?? "",
      status: input.status ?? "TODO",
      priority: input.priority ?? "MEDIUM",
      dueDate: input.dueDate ? new Date(input.dueDate) : null,
      projectId: input.projectId || null,
      position: (last?.position ?? 0) + 1,
      tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
      subtasks: {
        create: (input.subtasks ?? [])
          .map((title) => title.trim())
          .filter(Boolean)
          .map((subtaskTitle, index) => ({
            title: subtaskTitle,
            position: index + 1,
          })),
      },
    },
  });

  revalidateTasks();
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  return { ok: true as const, id: task.id };
}

export async function updateTaskAction(input: {
  id: string;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  projectId?: string | null;
  tags?: string[];
  subtasks?: { id?: string; title: string; completed: boolean }[];
}) {
  const user = await requireUser();
  const existing = await db.task.findFirst({ where: { id: input.id, userId: user.id } });
  if (!existing) return { error: "Task not found." };

  const title = input.title.trim();
  if (!title) return { error: "A task needs a title." };

  const tags = await ensureTags(user.id, input.tags ?? []);

  await db.$transaction([
    db.taskTag.deleteMany({ where: { taskId: input.id } }),
    db.taskSubtask.deleteMany({ where: { taskId: input.id } }),
    db.task.update({
      where: { id: input.id },
      data: {
        title,
        description: input.description?.trim() ?? "",
        status: input.status ?? existing.status,
        priority: input.priority ?? existing.priority,
        dueDate: input.dueDate ? new Date(input.dueDate) : null,
        projectId: input.projectId || null,
        tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
        subtasks: {
          create: (input.subtasks ?? [])
            .map((subtask) => ({ ...subtask, title: subtask.title.trim() }))
            .filter((subtask) => subtask.title)
            .map((subtask, index) => ({
              title: subtask.title,
              completed: subtask.completed,
              position: index + 1,
            })),
        },
      },
    }),
  ]);

  revalidateTasks();
  revalidatePath(`/projects/${existing.projectId ?? ""}`);
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  return { ok: true as const };
}

export async function deleteTaskAction(id: string) {
  const user = await requireUser();
  const existing = await db.task.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Task not found." };
  await db.task.delete({ where: { id } });
  revalidateTasks();
  if (existing.projectId) revalidatePath(`/projects/${existing.projectId}`);
  return { ok: true as const };
}

export async function moveTaskAction(id: string, status: TaskStatus, position: number) {
  const user = await requireUser();
  const existing = await db.task.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Task not found." };
  await db.task.update({
    where: { id },
    data: { status, position },
  });
  revalidateTasks();
  return { ok: true as const };
}

export async function toggleTaskDoneAction(id: string) {
  const user = await requireUser();
  const existing = await db.task.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Task not found." };
  await db.task.update({
    where: { id },
    data: { status: existing.status === "DONE" ? "TODO" : "DONE" },
  });
  revalidateTasks();
  return { ok: true as const };
}

export async function toggleSubtaskAction(id: string, completed: boolean) {
  const user = await requireUser();
  const subtask = await db.taskSubtask.findFirst({
    where: { id, task: { userId: user.id } },
  });
  if (!subtask) return { error: "Subtask not found." };
  await db.taskSubtask.update({ where: { id }, data: { completed } });
  revalidateTasks();
  return { ok: true as const };
}
