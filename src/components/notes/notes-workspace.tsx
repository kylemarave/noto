"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { format } from "date-fns";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { EmptyState } from "@/components/ui/empty";
import { PageFill, TextAction } from "@/components/layout/page";
import { NoteEditor } from "@/components/notes/note-editor";
import { createNoteAction } from "@/server/actions/notes";
import { actionId, showActionError } from "@/lib/action-result";
import { cn } from "@/lib/utils";
import type { NoteWithRelations, ProjectOption } from "@/server/queries";

export function NotesWorkspace({
  notes,
  projects,
  selected,
  variant = "index",
}: {
  notes: NoteWithRelations[];
  projects: ProjectOption[];
  selected?: NoteWithRelations | null;
  variant?: "index" | "detail";
}) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState("ALL");
  const [pinnedOnly, setPinnedOnly] = useState(false);
  const [showArchived, setShowArchived] = useState(
    Boolean(selected?.archived),
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return notes.filter((note) => {
      if (!showArchived && note.archived) return false;
      if (pinnedOnly && !note.pinned) return false;
      if (projectFilter !== "ALL" && note.projectId !== projectFilter) return false;
      if (q && !`${note.title} ${note.content}`.toLowerCase().includes(q)) {
        return false;
      }
      return true;
    });
  }, [notes, query, projectFilter, pinnedOnly, showArchived]);

  async function create() {
    const result = await createNoteAction({
      title: "Untitled note",
      projectId: projectFilter === "ALL" ? null : projectFilter,
    });
    if (showActionError(result)) return;
    toast.success("Note created");
    const id = actionId(result);
    if (id) router.push(`/notes/${id}`);
  }

  const list = (
    <aside className="flex h-full w-full shrink-0 flex-col gap-4 md:w-80 md:border-r md:border-border md:pr-6">
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search notes"
          className="min-w-0 w-full"
          aria-label="Search notes"
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Select
          className="w-40 min-w-0"
          value={projectFilter}
          onValueChange={setProjectFilter}
          options={[
            { value: "ALL", label: "All projects" },
            ...projects.map((project) => ({
              value: project.id,
              label: project.name,
            })),
          ]}
        />
        <button
          type="button"
          aria-pressed={pinnedOnly}
          onClick={() => setPinnedOnly((value) => !value)}
          className={cn(
            "h-9 shrink-0 cursor-pointer rounded-md px-3 text-12 transition-colors",
            pinnedOnly ? "inverse" : "bg-fill text-muted hover:text-text",
          )}
        >
          Pinned
        </button>
        <button
          type="button"
          aria-pressed={showArchived}
          onClick={() => setShowArchived((value) => !value)}
          className={cn(
            "h-9 shrink-0 cursor-pointer rounded-md px-3 text-12 transition-colors",
            showArchived ? "inverse" : "bg-fill text-muted hover:text-text",
          )}
        >
          Archived
        </button>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet."
          description="Write the things you need to remember."
          action={<TextAction onClick={() => void create()}>New note</TextAction>}
        />
      ) : filtered.length === 0 ? (
        <p className="text-13 text-subtle">No notes match these filters.</p>
      ) : (
        <ul className="-mx-2 flex min-h-0 flex-1 flex-col overflow-y-auto">
          {filtered.map((note) => {
            const active = selected?.id === note.id;
            return (
              <li key={note.id} className="border-b border-border last:border-b-0">
                <Link
                  href={`/notes/${note.id}`}
                  className={cn(
                    "touch-row flex flex-col gap-0.5 rounded-md px-2 py-2.5 transition-colors",
                    active ? "bg-fill text-text" : "hover:bg-fill",
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="truncate text-14 font-medium">{note.title}</span>
                    {note.pinned ? (
                      <span className="shrink-0 text-12 text-subtle">Pinned</span>
                    ) : null}
                    {note.archived ? (
                      <span className="shrink-0 text-12 text-subtle">Archived</span>
                    ) : null}
                  </span>
                  <span className="truncate text-12 text-subtle">
                    {note.content || "Empty note"}
                  </span>
                  <span className="tabular text-12 text-subtle">
                    {format(note.updatedAt, "MMM d")}
                    {note.project ? ` · ${note.project.name}` : ""}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </aside>
  );

  return (
    <PageFill className="gap-6 md:flex-row md:items-stretch">
      <div
        className={cn(
          "min-h-0",
          variant === "detail" ? "hidden md:flex md:flex-col" : "flex flex-col",
        )}
      >
        {list}
      </div>
      <div
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col",
          variant === "index" && "hidden md:flex",
        )}
      >
        {selected ? (
          <div className="flex min-h-0 flex-1 flex-col gap-4">
            {variant === "detail" ? (
              <Link
                href="/notes"
                className="text-12 text-subtle transition-colors hover:text-text md:hidden"
              >
                All notes
              </Link>
            ) : null}
            <NoteEditor note={selected} projects={projects} />
          </div>
        ) : (
          <p className="text-13 text-subtle">Select a note, or create one.</p>
        )}
      </div>
    </PageFill>
  );
}
