"use server";

import type { InboxKind } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { createTaskAction } from "./tasks";
import { createNoteAction } from "./notes";
import { createEventAction } from "./events";
import { createProjectAction } from "./projects";

function revalidateInbox() {
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
}

export async function createInboxItemAction(input: {
  title: string;
  body?: string;
  kind?: InboxKind;
}) {
  const user = await requireUser();
  const title = input.title.trim();
  if (!title) return { error: "Write something to capture." };

  await db.inboxItem.create({
    data: {
      userId: user.id,
      title,
      body: input.body?.trim() ?? "",
      kind: input.kind ?? "IDEA",
    },
  });
  revalidateInbox();
  return { ok: true as const };
}

export async function deleteInboxItemAction(id: string) {
  const user = await requireUser();
  const existing = await db.inboxItem.findFirst({ where: { id, userId: user.id } });
  if (!existing) return { error: "Inbox item not found." };
  await db.inboxItem.delete({ where: { id } });
  revalidateInbox();
  return { ok: true as const };
}

export async function convertInboxItemAction(
  id: string,
  destination: "task" | "note" | "event" | "project",
) {
  const user = await requireUser();
  const item = await db.inboxItem.findFirst({ where: { id, userId: user.id } });
  if (!item) return { error: "Inbox item not found." };

  let result:
    | { error: string }
    | { ok: true; id?: string };

  if (destination === "task") {
    result = await createTaskAction({
      title: item.title,
      description: item.body,
      status: "TODO",
    });
  } else if (destination === "note") {
    result = await createNoteAction({ title: item.title, content: item.body });
  } else if (destination === "project") {
    result = await createProjectAction({
      name: item.title,
      description: item.body,
    });
  } else {
    const start = new Date();
    start.setMinutes(0, 0, 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);
    result = await createEventAction({
      title: item.title,
      description: item.body,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
    });
  }

  if ("error" in result) return result;

  await db.inboxItem.update({ where: { id }, data: { processed: true } });
  revalidateInbox();
  return { ok: true as const, destination, id: result.id };
}
