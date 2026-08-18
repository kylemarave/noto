"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty";
import { createNoteAction } from "@/server/actions/notes";
import type { NoteWithRelations } from "@/server/queries";
import { actionId, showActionError } from "@/lib/action-result";

export function NoteList({
  notes,
  projectId,
}: {
  notes: NoteWithRelations[];
  projectId?: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.toLowerCase();
    return notes.filter((note) =>
      `${note.title} ${note.content}`.toLowerCase().includes(q),
    );
  }, [notes, query]);

  async function create() {
    const result = await createNoteAction({
      title: "Untitled note",
      projectId: projectId || null,
    });
    if (showActionError(result)) return;
    toast.success("Note created");
    const id = actionId(result);
    if (id) router.push(`/notes/${id}`);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes"
          className="max-w-xs"
        />
        <Button className="ml-auto" onClick={() => void create()}>
          New note
        </Button>
      </div>
      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet."
          description="Write the things you need to remember."
          action={<Button onClick={() => void create()}>+ Create note</Button>}
        />
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((note) => (
            <Link
              key={note.id}
              href={`/notes/${note.id}`}
              className="touch-row flex flex-col gap-2 rounded-[10px] border border-border bg-surface p-4 hover:border-line"
            >
              <div className="flex items-center justify-between gap-2">
                <h2 className="truncate text-14 font-medium">{note.title}</h2>
                {note.pinned ? <span className="text-12 text-subtle">Pinned</span> : null}
              </div>
              <p className="line-clamp-4 min-h-16 text-13 text-muted">
                {note.content || "Empty note"}
              </p>
              <p className="text-12 text-subtle">
                {format(note.updatedAt, "MMM d")}
                {note.project ? ` · ${note.project.name}` : ""}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
