"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty";
import { TextAction, Toolbar } from "@/components/layout/page";
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
    const q = query.trim().toLowerCase();
    if (!q) return notes;
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
    <div className="flex w-full flex-col gap-6">
      <Toolbar>
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes"
          className="max-w-xs"
          aria-label="Search notes"
        />
      </Toolbar>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet."
          description="Write the things you need to remember."
          action={<TextAction onClick={() => void create()}>New note</TextAction>}
        />
      ) : filtered.length === 0 ? (
        <p className="text-13 text-subtle">No notes match “{query}”.</p>
      ) : (
        <ul className="-mx-2 flex flex-col">
          {filtered.map((note) => (
            <li key={note.id} className="border-b border-border last:border-b-0">
              <Link
                href={`/notes/${note.id}`}
                className="touch-row flex items-baseline gap-3 rounded-md px-2 py-3 transition-colors hover:bg-fill"
              >
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-14 font-medium">{note.title}</span>
                    {note.pinned ? (
                      <span className="shrink-0 text-12 text-subtle">Pinned</span>
                    ) : null}
                  </span>
                  <span className="mt-0.5 block truncate text-12 text-subtle">
                    {note.content || "Empty note"}
                  </span>
                </span>
                <span className="tabular shrink-0 text-12 text-subtle">
                  {format(note.updatedAt, "MMM d")}
                  {note.project ? ` · ${note.project.name}` : ""}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
