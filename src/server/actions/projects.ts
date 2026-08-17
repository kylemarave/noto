"use server";

import type { ProjectStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";

function revalidateProjects(id?: string) {
  revalidatePath("/projects");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  if (id) revalidatePath(`/projects/${id}`);
}

export async function createProjectAction(input: {
  name: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}) {
  const user = await requireUser();
  const name = input.name.trim();
  if (!name) return { error: "A project needs a name." };

  const project = await db.project.create({
    data: {
      userId: user.id,
      name,
      description: input.description?.trim() ?? "",
      status: input.status ?? "ACTIVE",
      color: input.color ?? "#FFFFFF",
    },
  });

  revalidateProjects(project.id);
  return { ok: true as const, id: project.id };
}

export async function updateProjectAction(input: {
  id: string;
  name: string;
  description?: string;
  status?: ProjectStatus;
  color?: string;
}) {
  const user = await requireUser();
  const existing = await db.project.findFirst({ where: { id: input.id, userId: user.id } });
  if (!existing) return { error: "Project not found." };
  const name = input.name.trim();
  if (!name) return { error: "A project needs a name." };

  await db.project.update({
    where: { id: input.id },
    data: {
      name,
      description: input.description?.trim() ?? "",
      status: input.status ?? existing.status,
      color: input.color ?? existing.color,
    },
  });
  revalidateProjects(input.id);
  return { ok: true as const };
}

export async function deleteProjectAction(id: string) {
  const user = await requireUser();
  const existing = await db.project.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Project not found." };
  await db.project.delete({ where: { id } });
  revalidateProjects();
  redirect("/projects");
}

export async function toggleFavoriteAction(projectId: string) {
  const user = await requireUser();
  const project = await db.project.findFirst({ where: { id: projectId, userId: user.id } });
  if (!project) return { error: "Project not found." };

  const existing = await db.favorite.findUnique({ where: { projectId } });
  if (existing) {
    await db.favorite.delete({ where: { projectId } });
  } else {
    await db.favorite.create({ data: { userId: user.id, projectId } });
  }
  revalidateProjects(projectId);
  return { ok: true as const };
}
