"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { ensureTags } from "@/server/queries";

function revalidateNotes(id?: string) {
  revalidatePath("/notes");
  revalidatePath("/dashboard");
  if (id) revalidatePath(`/notes/${id}`);
}

export async function createNoteAction(input: {
  title?: string;
  content?: string;
  projectId?: string | null;
  tags?: string[];
}) {
  const user = await requireUser();
  const tags = await ensureTags(user.id, input.tags ?? []);
  const note = await db.note.create({
    data: {
      userId: user.id,
      title: input.title?.trim() || "Untitled note",
      content: input.content?.trim() ?? "",
      projectId: input.projectId || null,
      tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
    },
  });
  revalidateNotes(note.id);
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  return { ok: true as const, id: note.id };
}

export async function updateNoteAction(input: {
  id: string;
  title: string;
  content: string;
  projectId?: string | null;
  tags?: string[];
}) {
  const user = await requireUser();
  const existing = await db.note.findFirst({ where: { id: input.id, userId: user.id } });
  if (!existing) return { error: "Note not found." };

  const tags = await ensureTags(user.id, input.tags ?? []);
  await db.$transaction([
    db.noteTag.deleteMany({ where: { noteId: input.id } }),
    db.note.update({
      where: { id: input.id },
      data: {
        title: input.title.trim() || "Untitled note",
        content: input.content,
        projectId: input.projectId || null,
        tags: { create: tags.map((tag) => ({ tagId: tag.id })) },
      },
    }),
  ]);
  revalidateNotes(input.id);
  if (existing.projectId) revalidatePath(`/projects/${existing.projectId}`);
  if (input.projectId) revalidatePath(`/projects/${input.projectId}`);
  return { ok: true as const };
}

export async function deleteNoteAction(id: string) {
  const user = await requireUser();
  const existing = await db.note.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Note not found." };
  await db.note.delete({ where: { id } });
  revalidateNotes();
  if (existing.projectId) revalidatePath(`/projects/${existing.projectId}`);
  return { ok: true as const };
}

export async function togglePinNoteAction(id: string) {
  const user = await requireUser();
  const existing = await db.note.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Note not found." };
  await db.note.update({ where: { id }, data: { pinned: !existing.pinned } });
  revalidateNotes(id);
  return { ok: true as const };
}

export async function toggleArchiveNoteAction(id: string) {
  const user = await requireUser();
  const existing = await db.note.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Note not found." };
  await db.note.update({
    where: { id },
    data: { archived: !existing.archived, pinned: existing.archived ? existing.pinned : false },
  });
  revalidateNotes(id);
  return { ok: true as const };
}
